import { Command, CommandContext } from './command';
import config from '../config.json';

export default class FlipCommand implements Command {
    name = 'vote';
    summary = 'Get 3PG voting links, and support 3PG';
    cooldown = 1;
    module = 'General';
    
    execute = async(ctx: CommandContext) => {
        const details = config.bot.voteURLs.join(`\n`);
        return ctx.channel.send(details);
    }
}
