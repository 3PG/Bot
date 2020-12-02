import { Router } from 'express';
import { SavedMember } from '../../data/models/member';
import { XPCardGenerator } from '../modules/image/xp-card-generator';
import Deps from '../../utils/deps';
import Members from '../../data/members';
import Ranks from '../modules/ranks';
import Users from '../../data/users';
import Guilds from '../../data/guilds';
import Logs from '../../data/logs';
import AuditLogger from '../modules/audit-logger';
import { TextChannel, Client } from 'discord.js';
import Leveling from '../../modules/xp/leveling';
import Timers from '../../modules/timers/timers';
import { sendError } from '../modules/api-utils';
import stringify from 'json-stringify-safe';
import Emit from '../../services/emit';
import { getManagableGuilds, leaderboardMember, validateGuildManager, getUser } from '../modules/api-utils';

export const router = Router();

const bot = Deps.get<Client>(Client);
const emit = Deps.get<Emit>(Emit);
const logs = Deps.get<Logs>(Logs);
const guilds = Deps.get<Guilds>(Guilds);
const members = Deps.get<Members>(Members);
const timers = Deps.get<Timers>(Timers);
const users = Deps.get<Users>(Users);

router.get('/', async (req, res) => {
  try {    
    const guilds = await getManagableGuilds(req.query.key);
    res.json(guilds);
  } catch (error) { sendError(res, 400, error); }
});

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const guild = bot.guilds.cache.get(id);

    res.json({
      channels: guild.channels.cache,
      guild,
      log: await logs.get(guild),
      saved: await guilds.get(guild),
      status: getBotStatus(id),
      roles: guild?.roles.cache.filter(r => r.name !== '@everyone'),
      timers: JSON.parse(stringify(timers.get(id)))
    });
  } catch (error) { sendError(res, 400, error); }
});

router.get('/:id/channels/:channelId/messages/:messageId', async(req, res) => {
  try {
    const guild = bot.guilds.cache.get(req.params.id);
    const channel = guild?.channels.cache
      .get(req.params.channelId) as TextChannel;   

    const msg = await channel.messages.fetch(req.params.messageId);

    res.status(200).json({
      ...msg,
      member: guild.members.cache.get(msg.author.id),
      user: bot.users.cache.get(msg.author.id)
    });
  } catch (error) { sendError(res, 400, error); }
});

router.get('/:id/warnings', async(req, res) => {
  try {
    const members = await SavedMember.find({ guildId: req.params.id });    

    let warnings = [];
    for (const member of members)
      for (const warning of member.warnings) {
        const number = member.warnings.indexOf(warning) + 1;
        warnings.push({ ...warning, userId: member.userId, number });
      }
    res.json(warnings);    
  } catch (error) { sendError(res, 400, error); }
});

router.get('/:id/members', async (req, res) => {
  try {
    const savedMembers = await SavedMember.find({ guildId: req.params.id }).lean();    
    let rankedMembers = [];
    for (const savedMember of savedMembers) {
      const member = bot.guilds.cache
        .get(req.params.id).members.cache
        .get(savedMember.userId);
      if (!member) continue;
      
      const xpInfo = Leveling.xpInfo(savedMember.xp);
      rankedMembers.push(leaderboardMember(member.user, xpInfo));
    }
    rankedMembers.sort((a, b) => b.xp - a.xp);
  
    res.json(rankedMembers);
  } catch (error) { sendError(res, 400, error); }
});

router.get('/:guildId/members/:memberId/xp-card', async (req, res) => {
  try {
    const { guildId, memberId } = req.params;

    const user = bot.users.cache.get(memberId);       
    const savedUser = await users.get(user); 

    const guild = bot.guilds.cache.get(guildId);
    const member = guild?.members.cache.get(memberId);
    if (!member)
      throw TypeError('No member found');
    
    const savedMember = await members.get(member);    
    const savedMembers = await SavedMember.find({ guildId });
    
    const rank = Ranks.get(member, savedMembers);    
    
    const generator = new XPCardGenerator(savedUser, rank);
    const image = await generator.generate(savedMember);
    
    res.set({'Content-Type': 'image/png'}).send(image);
  } catch (error) { sendError(res, 400, error); }
});

router.put('/:id/:module', async (req, res) => {
  try {
    const { id, module } = req.params; 

    await validateGuildManager(req.query.key, id);
    
    const isValidModule = ['autoMod', 'commands', 'general', 'leveling', 'logs', 'music', 'reactionRoles', 'timers', 'settings'];
    if (!isValidModule)
      throw new TypeError('Module not configured');

    const user = await getUser(req.query.key);
    const guild = bot.guilds.cache.get(id); 
    const savedGuild = await guilds.get(guild);    

    const change = AuditLogger.getChanges({
      old: savedGuild[module],
      new: req.body
    }, module, user.id);

    savedGuild[module] = req.body;
    await guilds.save(savedGuild);
    
    if (module === 'timers')
      await resetTimers(id);

    await logs.logChanges(change, guild);

    emit.configSaved(guild, user, change);

    res.json(savedGuild);
  } catch (error) { sendError(res, 400, error); }
});

router.delete('/:id', async(req, res) => {
  try {
    const id = req.params.id;
    await validateGuildManager(req.query.key, id);  
    
    const guild = bot.guilds.cache.get(req.params.id);
    const savedGuild = await guilds.get(guild);
    
    await savedGuild.remove();
    
    res.send({ success: true })
  } catch (error) { sendError(res, 400, error); }
});

function getBotStatus(id: string) {
  return {
    hasAdmin: bot.guilds.cache
      .get(id)?.members.cache
      .get(bot.user.id)
      ?.hasPermission('ADMINISTRATOR')
  }
}

async function resetTimers(id: string) {
  await timers.endTimers(id);
  await timers.startTimers(id);
}
