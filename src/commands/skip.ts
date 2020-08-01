import { Command, CommandContext, Permission } from './command';
import Deps from '../utils/deps';
import Music from '../modules/music/music';

export default class SkipCommand implements Command {
    precondition: Permission = 'SPEAK';
    name = 'skip';
    summary = 'Skip current playing track';
    cooldown = 5;
    module = 'Music';

    constructor(private music = Deps.get<Music>(Music)) {}
    
    execute = async(ctx: CommandContext) => {
        const player = this.music.joinAndGetPlayer(ctx.member, ctx.channel);
        this.music.skip(player);
    }
}
