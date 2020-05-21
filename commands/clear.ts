import { Command, CommandContext } from './command';

export default class ClearCommand implements Command {
    name = 'clear';
    summary = 'Clear all messages that are less than 2 weeks old, default (100).';
    cooldown = 5;
    module = 'Auto-mod';
    
    execute = async(ctx: CommandContext, count = '100') => {
        const msgs = await ctx.channel.bulkDelete(Number(count));
        const reminder = await ctx.channel.send(`Deleted \`${msgs.size}\` messages`);
        setTimeout(() => reminder.delete(), 3 * 1000);
    };
}
