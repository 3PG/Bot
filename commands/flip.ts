import { Command, CommandContext } from './command';

export default class FlipCommand implements Command {
    name = 'flip';
    summary = 'Heads or Tails?';
    cooldown = 1;
    module = 'General';
    
    execute = async(ctx: CommandContext) => {
        const result = (Math.random() >= 0.5) ? 'Heads' : 'Tails';
        return ctx.channel.send(result);
    }
}
