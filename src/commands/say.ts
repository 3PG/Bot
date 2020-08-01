import { Command, CommandContext, Permission } from './command';

export default class SayCommand implements Command {
    precondition: Permission = 'MANAGE_MESSAGES';
    name = 'say';
    usage = 'say 3PG is the best bot';
    summary = 'Get 3PG to say... anything.';
    cooldown = 3;
    module = 'General';
    
    execute = async(ctx: CommandContext, ...args: string[]) => {
        return ctx.channel.send(args?.join(' '));
    }
}
