import { Command, CommandContext, Permission } from './command';

export default class HelpCommand implements Command {
  precondition: Permission = '';
  name = 'help';
  summary = 'Send help...';
  cooldown = 3;
  module = 'General';
  
  execute = async(ctx: CommandContext) => {
    ctx.channel.send(`${process.env.DASHBOARD_URL}/commands`);
  }
}
