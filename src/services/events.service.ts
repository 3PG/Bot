import Log from '../utils/log';
import fs from 'fs';
import { promisify } from 'util';
import EventHandler from './handlers/event-handler';
import { EventEmitter } from 'events';
import { Client } from 'discord.js';
import Deps from '../utils/deps';

const readdir = promisify(fs.readdir);

export default class EventsService {
  private readonly handlers: EventHandler[] = [];
  private readonly customHandlers: EventHandler[] = [];

  constructor(
    private bot = Deps.get<Client>(Client),
    private emitter = Deps.get<EventEmitter>(EventEmitter)) {}

  async init() {
    const handlerFiles = await readdir(`${__dirname}/handlers`);
    const customHandlerFiles = await readdir(`${__dirname}/custom-handlers`);
    
    for (const file of handlerFiles) {      
      const Handler = await require(`./handlers/${file}`).default;
      const handler = Handler && new Handler();
      if (!handler?.on) continue;

      this.handlers.push(new Handler());
    }    
    for (const file of customHandlerFiles) {      
      const Handler = await require(`./custom-handlers/${file}`).default;
      const handler = Handler && new Handler();
      if (!handler?.on) continue;

      this.customHandlers.push(new Handler());
    }
    this.hookEvents();
  }

  private hookEvents() {
    for (const handler of this.handlers)
      this.bot.on(handler.on as any, handler.invoke.bind(handler));

    for (const handler of this.customHandlers)
      this.emitter.on(handler.on, handler.invoke.bind(handler));

    Log.info(`Loaded: ${this.handlers.length} handlers`, 'events');
    Log.info(`Loaded: ${this.customHandlers.length} custom handlers`, 'events');
  }
}