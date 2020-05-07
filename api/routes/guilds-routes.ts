import { Router } from 'express';
import config from '../../config.json';
import { SavedMember } from '../../models/member';
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
import { User, Guild, TextChannel } from 'discord.js';
import Leveling from '../../modules/xp/leveling';
import Log from '../../utils/log';
import { Change } from '../../models/log';
import Timers from '../../modules/timers/timers';

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
    } catch (error) { res.status(400).json(error); }
});

router.put('/:id/:module', async (req, res) => {
    try {
        const { id, module } = req.params; 
        
        const isValidModule = config.modules.some(m => m === module);        
        if (!isValidModule)
            throw new TypeError('Module not configured');

        await validateGuildManager(req.query.key, id);

        const user = await getUser(req.query.key);
        const guild = bot.guilds.cache.get(id); 
        const savedGuild = await guilds.get(guild);
        
        const change = AuditLogger.getChanges({
            old: savedGuild[module],
            new: req.body
        }, module, user.id);

        savedGuild[module] = req.body;
        await guilds.save(savedGuild);

        await logs.logChanges(change, guild);

        emitConfigSaved(guild, user, change);

        res.json(savedGuild);
    } catch (error) {
        Log.error(error, 'api');
        res.status(400).json(error);
    }
});

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

router.get('/:id/config', async (req, res) => {
    try {
        const guild = bot.guilds.cache.get(req.params.id);
        const savedGuild = await guilds.get(guild);
        res.json(savedGuild);
    } catch (error) { res.status(400).json(error); }
});

router.get('/:id/channels', async (req, res) => {
    try {
        const guild = bot.guilds.cache.get(req.params.id);
        res.json(guild.channels.cache);        
    } catch (error) { res.status(400).json(error); }
});

router.get('/:id/channels/:channelId/messages/:messageId', (req, res) => {
    try {
        const guild = bot.guilds.cache.get(req.params.id);
        const channel = guild.channels.cache
            .get(req.params.channelId) as TextChannel;
        const message = channel.messages.cache.get(req.params.messageId);

        res.status(200).json(message);
    } catch (error) { res.status(400).json(error); }
});

router.get('/:id/log', async(req, res) => {
    try {
        const guild = bot.guilds.cache.get(req.params.id);
        const log = await logs.get(guild);
        res.json(log);
    } catch (error) { res.status(400).json(error); }
});

router.get('/:id/timers', (req, res) => {
    try {
        const guildTimers = timers.currentTimers.get(req.params.id);
        if (!guildTimers || guildTimers?.length <= 0)
            return res.json([]);
    
        for (const timer of guildTimers)
            delete timer.id;
    
        res.json(guildTimers);        
    } catch (error) { res.status(400).json(error); }
});

router.get('/:id/timers/start', async(req, res) => {
    try {
        await timers.startTimers(req.params.id);
        res.status(200).json({ success: true });
    } catch (error) { res.status(400).json(error); } 
});

router.get('/:id/timers/:timerId/cancel', (req, res) => {
    try {
        const guildTimers = timers.currentTimers.get(req.params.id) ?? [];
        guildTimers.splice(
            guildTimers.findIndex(t => t.id === req.params.timerId), 1);
            
        timers.currentTimers.set(req.params.id, guildTimers);
    
        res.status(200).json({ success: true });
    } catch (error) { res.status(400).json(error); }
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
    } catch (error) { res.status(400).json(error); }
});

router.get('/:id/public', (req, res) => {
    const guild = bot.guilds.cache.get(req.params.id);
    res.json(guild);
});

router.get('/:id/roles', async (req, res) => {
    try {
        const guild = bot.guilds.cache.get(req.params.id);
        res.json(guild.roles.cache.filter(r => r.name !== '@everyone'));        
    } catch { res.status(404).send('Not Found'); }
});

router.get('/:id/members', async (req, res) => {
    try {
        const savedMembers = await SavedMember.find({ guildId: req.params.id }).lean();        
        let rankedMembers = [];
        for (const member of savedMembers) {
            const user = bot.users.cache.get(member.userId);
            if (!user) continue;
            
            const xpInfo = Leveling.xpInfo(member.xp);
            rankedMembers.push(leaderboardMember(user, xpInfo));
        }
        rankedMembers.sort((a, b) => b.xp - a.xp);
    
        res.json(rankedMembers);
    } catch (error) { res.status(400).send(error?.message); }
});

function leaderboardMember(user: User, xpInfo: any) {
    return {
        id: user.id,
        username: user.username,
        tag: '#' + user.discriminator,
        displayAvatarURL: user.displayAvatarURL({ dynamic: true }),
        ...xpInfo
    };
}

async function getManagableGuilds(key: string) {
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
    } catch (error) { res.status(400).send(error?.message); }
});

async function validateGuildManager(key: string, id: string) {
    if (!key)
        throw new TypeError();
    const guilds = await getManagableGuilds(key);        
        
    if (!guilds.has(id))
        throw TypeError();
}

async function getUser(key: string) {    
    const { id } = await AuthClient.getUser(key);
    return bot.users.cache.get(id);
}
