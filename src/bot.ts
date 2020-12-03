import { config } from 'dotenv';
config();

import { Client } from 'discord.js';
import mongoose from 'mongoose';
import Deps from './utils/deps';

import EventService from './services/events.service';
import Log from './utils/log';
import API from './api/server';
import EventsService from './services/events.service';

export const bot = Deps.get<Client>(Client);
bot.options.messageCacheLifetime = 0;
bot.options.messageCacheMaxSize = 16;
bot.options.partials = ['GUILD_MEMBER', 'MESSAGE', 'REACTION'];

bot.login(process.env.BOT_TOKEN);

Deps.get<EventService>(EventsService).init();
Deps.build(API);

mongoose.connect(process.env.MONGO_URI, { 
  useUnifiedTopology: true, 
  useNewUrlParser: true, 
  useFindAndModify: false
}, (error) => error
  ? Log.error(error.message, 'data')
  : Log.info('Connected to db', 'data'));

import './keep-alive';