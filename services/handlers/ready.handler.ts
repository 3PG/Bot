import Log from '../../utils/log';
import EventHandler from './event-handler';
import Deps from '../../utils/deps';
import Music from '../../modules/music/music';
import { bot } from '../../bot';
import Timers from '../../modules/timers/timers';

export default class ReadyHandler implements EventHandler {
    on = 'ready';
    
    constructor(
        private music = Deps.get<Music>(Music),
        private timers = Deps.get<Timers>(Timers)) {}

    async invoke(...args: any) {        
        Log.info(`It's live!`, `events`);
        
        this.music.initialize();
        await this.timers.initialize();

        bot.user?.setActivity('3PG.xyz');
    }
}
