import { Client } from 'discord.js';
import config from '../config.json';
import mongoose from 'mongoose';
import Deps from './utils/deps';

import EventService from './services/events.service';
import Log from './utils/log';
import API from './api/server';
import EventsService from './services/events.service';

const bot = Deps.get<Client>(Client);
bot.options.messageCacheLifetime = 0;
bot.options.messageCacheMaxSize = 16;
bot.options.partials = ['GUILD_MEMBER', 'MESSAGE', 'REACTION'];

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
