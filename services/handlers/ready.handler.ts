import Log from '../../utils/log';
import EventHandler from './event-handler';
import Deps from '../../utils/deps';
import Music from '../../modules/music/music';
import { bot } from '../../bot';
import Timers from '../../modules/timers/timers';
import CommandService from '../command.service';
import config from '../../config.json';
import AutoMod from '../../modules/auto-mod/auto-mod';
import Crates from '../../api/modules/crates/crates';
import { ClientEvents } from 'discord.js';
import BotStatsService from '../bot-stats.service';

export default class ReadyHandler implements EventHandler {
    started = false;

    on: keyof ClientEvents = 'ready';
    
    constructor(
        private autoMod = Deps.get<AutoMod>(AutoMod),
        private botStats = Deps.get<BotStatsService>(BotStatsService),
        private commandService = Deps.get<CommandService>(CommandService),
        private crates = Deps.get<Crates>(Crates),
        private music = Deps.get<Music>(Music),
        private timers = Deps.get<Timers>(Timers)) {}

    async invoke() {
        Log.info(`It's live!`, `events`);

        if (this.started) return;
        this.started = true;
        
        await this.autoMod.init();
        // await this.botStats.init();
        await this.commandService.init();
        await this.crates.init();
        this.music.init();
        await this.timers.init();

        bot.user?.setActivity(config.bot.activity);
    }
}
