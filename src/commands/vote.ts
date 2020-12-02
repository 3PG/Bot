import { Command, CommandContext, Permission } from './command';

export default class FlipCommand implements Command {
  precondition: Permission = '';
  name = 'vote';
  summary = 'Get 3PG voting links, and support 3PG';
  cooldown = 1;
  module = 'General';
  
  execute = async(ctx: CommandContext) => {
    return ctx.channel.send(`
      https://dbots.co/bots/525935335918665760/vote
      https://top.gg/bot/525935335918665760/vote
      https://discordbotlist.com/bots/525935335918665760/upvote`.trim()
    );
  }
}
