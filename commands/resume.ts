import { Command, CommandContext } from './command';
import Deps from '../utils/deps';
import Music from '../modules/music/music';

export default class ResumeCommand implements Command {
    name = 'resume';
    summary = 'Resume playing a track if paused.';
    module = 'Music';

    constructor(private music = Deps.get<Music>(Music)) {}
    
    execute = (ctx: CommandContext) => {
        const player = this.music.joinAndGetPlayer(ctx);

        if (player.playing)
            throw new TypeError('Player is already resumed.');
            
        player.pause(false);
        ctx.channel.send(`**Resumed**: \`${player.queue[0].title}\``);
    }
}
