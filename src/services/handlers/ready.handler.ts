import Log from '../../utils/log';
import EventHandler from './event-handler';
import Deps from '../../utils/deps';
import Music from '../../modules/music/music';
import Timers from '../../modules/timers/timers';
import CommandService from '../command.service';
import AutoMod from '../../modules/auto-mod/auto-mod';
import { ClientEvents, Client } from 'discord.js';

export default class ReadyHandler implements EventHandler {
  started = false;

  on: keyof ClientEvents = 'ready';
  
  constructor(
    private autoMod = Deps.get<AutoMod>(AutoMod),
    private bot = Deps.get<Client>(Client),
    private commandService = Deps.get<CommandService>(CommandService),
    private music = Deps.get<Music>(Music),
    private timers = Deps.get<Timers>(Timers)) {}

  async invoke() {    
    Log.info(`It's live!`, `events`);

    if (this.started) return;
    this.started = true;
    
    await this.autoMod.init();
    await this.commandService.init();
    this.music.initialize();
    await this.timers.init();

    this.bot.user?.setActivity(`3PG.xyz`);
  }
}
