import { Command, CommandContext } from './command';

export default class SayCommand implements Command {
    name = 'say';
    summary = 'Get 3PG to say... anything.';
    cooldown = 3;
    module = 'General';
    
    execute = async(ctx: CommandContext, ...args: string[]) => {
        return ctx.channel.send(args.join(' '));
    }
}
