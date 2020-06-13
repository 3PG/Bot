import { Router } from 'express';
import config from '../../config.json';
import { SavedMember } from '../../data/models/member';
import { AuthClient } from '../server';
import { XPCardGenerator } from '../modules/image/xp-card-generator';
import { bot, emitter } from '../../bot';
import Deps from '../../utils/deps';
import Members from '../../data/members';
import Ranks from '../modules/ranks';
import Users from '../../data/users';
import Guilds from '../../data/guilds';
import Logs from '../../data/logs';
import AuditLogger from '../modules/audit-logger';
import { User, Guild, TextChannel, VoiceChannel, GuildMember } from 'discord.js';
import Leveling from '../../modules/xp/leveling';
import Log from '../../utils/log';
import { Change } from '../../data/models/log';
import Timers from '../../modules/timers/timers';
import { getUser } from './user-routes';
import { sendError } from './api-routes';

export const router = Router();

const logs = Deps.get<Logs>(Logs),
      guilds = Deps.get<Guilds>(Guilds),
      members = Deps.get<Members>(Members),
      timers = Deps.get<Timers>(Timers),
      users = Deps.get<Users>(Users);

router.get('/', async (req, res) => {
    try {        
        const guilds = await getManagableGuilds(req.query.key);
        res.json(guilds);
    } catch (error) { sendError(res, 400, error); }
});

router.put('/:id/:module', async (req, res) => {
    try {
        const { id, module } = req.params; 

        await validateGuildManager(req.query.key, id);
        
        const isValidModule = config.modules.some(m => m === module);        
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

        emitConfigSaved(guild, user, change);

        res.json(savedGuild);
    } catch (error) { sendError(res, 400, error); }
});
async function resetTimers(id: string) {        
    timers.cancelTimers(id);
    await timers.startTimers(id);
}
function emitConfigSaved(guild: Guild, user: User, change: Change) {
    emitter.emit('configUpdate', {
        guild,
        instigator: user,
        module: change.module,
        new: change.changes.new,
        old: change.changes.old
    } as ConfigUpdateArgs);
}

export interface ConfigUpdateArgs {
    guild: Guild;
    instigator: User;
    module: string;
    new: any;
    old: any;
}

router.delete('/:id/config', async(req, res) => {
    try {
        const id = req.params.id;
        await validateGuildManager(req.query.key, id);    
        
        const guild = bot.guilds.cache.get(req.params.id);
        const savedGuild = await guilds.get(guild);
        
        await savedGuild.remove();
        
        res.send({ success: true })
    } catch (error) { sendError(res, 400, error); }
});

router.get('/:id/config', async (req, res) => {
    try {
        const guild = bot.guilds.cache.get(req.params.id);
        const savedGuild = await guilds.get(guild);
        res.json(savedGuild);
    } catch (error) { sendError(res, 400, error); }
});

router.get('/:id/channels', async (req, res) => {
    try {
        const guild = bot.guilds.cache.get(req.params.id);
        res.json(guild.channels.cache);
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

router.get('/:id/log', async(req, res) => {
    try {
        const guild = bot.guilds.cache.get(req.params.id);
        const log = await logs.get(guild);
        res.json(log);
    } catch (error) { sendError(res, 400, error); }
});

router.get('/:id/timers', (req, res) => {
    try {
        const guildTimers = timers.currentTimers.get(req.params.id);
        if (!guildTimers || guildTimers?.length <= 0)
            return res.json([]);
    
        for (const timer of guildTimers)
            delete timer.timeout;
    
        res.json(guildTimers);        
    } catch (error) { sendError(res, 400, error); }
});

router.get('/:id/warnings', async(req, res) => {
    try {
        const members = await SavedMember.find({ guildId: req.params.id });      

        let warnings = [];
        for (const member of members)
            for (const warning of member.warnings) {
                const number = member.warnings.indexOf(warning) + 1;
                warnings.push({
                    ...warning,
                    userId: member.userId,
                    number
                });
            }
        res.json(warnings);        
    } catch (error) { sendError(res, 400, error); }
});

router.get('/:id/public', (req, res) => {
    const guild = bot.guilds.cache.get(req.params.id);
    res.json(guild);
});

router.get('/:id/roles', async (req, res) => {
    try {
        const guild = bot.guilds.cache.get(req.params.id);
        res.json(guild?.roles.cache.filter(r => r.name !== '@everyone'));
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
            rankedMembers.push(leaderboardMember(member, xpInfo));
        }
        rankedMembers.sort((a, b) => b.xp - a.xp);
    
        res.json(rankedMembers);
    } catch (error) { sendError(res, 400, error); }
});

function leaderboardMember({ user }: GuildMember, xpInfo: any) {
    return {
        id: user.id,
        username: user.username,
        tag: '#' + user.discriminator,
        displayAvatarURL: user.displayAvatarURL({ dynamic: true }),
        ...xpInfo
    };
}

router.get('/:guildId/members/:memberId/xp-card', async (req, res) => {
    try {
        const { guildId, memberId } = req.params;

        const user = bot.users.cache.get(memberId);             
        const savedUser = await users.get(user); 

        const guild = bot.guilds.cache.get(guildId);
        const member = guild?.members.cache.get(memberId);        
        if (!member)
            throw Error();
        
        const savedMember = await members.get(member);        
        const savedMembers = await SavedMember.find({ guildId });
        
        const rank = Ranks.get(member, savedMembers);        
        
        const generator = new XPCardGenerator(savedUser, rank);
        const image = await generator.generate(savedMember);
        
        res.set({'Content-Type': 'image/png'}).send(image);
    } catch (error) { sendError(res, 400, error); }
});

export async function validateGuildManager(key: string, guildId: string) {
    if (!key)
        throw new TypeError();
    const guilds = await getManagableGuilds(key);        
        
    if (!guilds.has(guildId))
        throw TypeError();
}

export async function getManagableGuilds(key: string) {
    const manageableGuilds = [];
    let userGuilds = await AuthClient.getGuilds(key);
    for (const id of userGuilds.keys()) {        
        const authGuild = userGuilds.get(id);        
        const hasManager = authGuild._permissions
            .some(p => p === config.api.managerPermission);

        if (hasManager)
            manageableGuilds.push(id);
    }
    return bot.guilds.cache
        .filter(g => manageableGuilds.some(id => id === g.id));
}
