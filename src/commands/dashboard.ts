import { Command, CommandContext, Permission } from './command';

export default class DashboardCommand implements Command {
  precondition: Permission = 'MANAGE_GUILD';
  name = 'dashboard';
  summary = `Get a link to the server's dashboard`;
  cooldown = 3;
  module = 'General';
  
  execute = async(ctx: CommandContext) => {
    return ctx.channel.send(`${process.env.DASHBOARD_URL}/servers/${ctx.guild.id}`);
  }
}
