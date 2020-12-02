import { Command, CommandContext, Permission } from './command';

export default class MusicCommand implements Command {
  precondition: Permission = 'MANAGE_GUILD';
  name = 'music';
  summary = `Get a link to the server's music manager`;
  cooldown = 3;
  module = 'Music';
  
  execute = async(ctx: CommandContext) => {
    return ctx.channel.send(`${process.env.DASHBOARD_URL}/servers/${ctx.guild.id}/music`);
  }
}
