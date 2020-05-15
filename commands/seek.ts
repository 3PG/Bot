import { Command, CommandContext } from './command';
import Deps from '../utils/deps';
import Music from '../modules/music/music';

export default class PlayCommand implements Command {
    name = 'seek';
    summary = 'Go to a position in a track.';
    cooldown = 1;
    module = 'Music';

    constructor(private music = Deps.get<Music>(Music)) {}
    
    execute = async(ctx: CommandContext, position: string) => {
        const player = this.music.joinAndGetPlayer(ctx.member, ctx.channel);
        
        if (player.queue.size <= 0)
            throw new TypeError('No tracks currently playing');
        const pos = Number(position);
        if (!pos)
            throw new TypeError('Position must be a number');
        
        if (!pos)
            return ctx.channel.send(`Track at: \`${this.music.getDurationString(player)}\``);

        player.seek(pos * 1000);

        return ctx.channel.send(`Now at \`${this.music.getDurationString(player)}\`.`);
    }
}
