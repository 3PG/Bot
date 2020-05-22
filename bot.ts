import { Client } from 'discord.js';
import config from './config.json';
import CommandService from './services/command.service';
import mongoose from 'mongoose';
import Deps from './utils/deps';
import { EventEmitter } from 'events';

import EventsService from './services/events.service';
import Guilds from './data/guilds';
import Users from './data/users';
import Members from './data/members';
import AutoMod from './modules/auto-mod/auto-mod';
import Leveling from './modules/xp/leveling';
import Music from './modules/music/music';
import API from './api/server';
import Cooldowns from './services/cooldowns';
import Validators from './services/validators';
import ReactionRoles from './modules/general/reaction-roles';
import Log from './utils/log';
import Crates from './api/modules/crates/crates';

export const bot = new Client({
    messageCacheLifetime: 60,
    messageCacheMaxSize: 100,
    fetchAllMembers: true,
    partials: ['REACTION', 'MESSAGE', 'GUILD_MEMBER', 'USER', 'CHANNEL']
});
export const emitter = new EventEmitter();

bot.login(config.bot.token);

Deps.build(
    Guilds,
    Members,
    Users,
    
    AutoMod,
    Leveling,
    Music,
    ReactionRoles,

    API,
    CommandService,
    Crates,
    Cooldowns,
    EventsService,
    Validators
);

mongoose.connect(config.mongoURL, { 
    useUnifiedTopology: true, 
    useNewUrlParser: true, 
    useFindAndModify: false
}, (err) => err ? Log.error('Failed to connect to db') : Log.info('Connected to db'));
