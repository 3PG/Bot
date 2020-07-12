import { Client } from 'discord.js';
import config from './config.json';
import mongoose from 'mongoose';
import Deps from './utils/deps';
import { EventEmitter } from 'events';

import EventService from './services/events.service';
import Log from './utils/log';
import API from './api/server';

export const bot = new Client({
    messageCacheLifetime: 60,
    messageCacheMaxSize: 100,
    fetchAllMembers: true,
    partials: ['REACTION', 'MESSAGE', 'GUILD_MEMBER', 'USER', 'CHANNEL']
});
export const emitter = new EventEmitter();

Deps.build(EventService, API);

bot.login(config.bot.token);

mongoose.connect(config.mongoURL, { 
    useUnifiedTopology: true, 
    useNewUrlParser: true, 
    useFindAndModify: false
}, (error) => error ? Log.error('Failed to connect to db') : Log.info('Connected to db'));
