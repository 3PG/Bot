import { Client } from 'discord.js';
import config from '../config.json';
import mongoose from 'mongoose';
import Deps from './utils/deps';
import { EventEmitter } from 'events';

import EventService from './services/events.service';
import Log from './utils/log';
import API from './api/server';
import EventsService from './services/events.service';

export const bot = new Client({
    messageCacheLifetime: 0,
    messageCacheMaxSize: 16,
    partials: ['GUILD_MEMBER', 'MESSAGE', 'REACTION']
});
export const emitter = new EventEmitter();

bot.login(config.bot.token);

Deps.get<EventService>(EventsService).init();
Deps.build(API);

mongoose.connect(config.mongoURL, { 
    useUnifiedTopology: true, 
    useNewUrlParser: true, 
    useFindAndModify: false
}, (error) => error
    ? Log.error(error.message, 'data')
    : Log.info('Connected to db', 'data'));
