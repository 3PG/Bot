import { Command, CommandContext } from './command';
import Deps from '../utils/deps';
import Music from '../modules/music/music';

export default class PlayCommand implements Command {
    name = 'shuffle';
    summary = 'Shuffle a playlist.';
    cooldown = 3;
    module = 'Music';

    constructor(private music = Deps.get<Music>(Music)) {}
    
    execute = async(ctx: CommandContext) => {
        const player = this.music.joinAndGetPlayer(ctx.member, ctx.channel);
        player.queue.shuffle();
        
        return ctx.channel.send('List shuffled.');
    }
}
