import { Command, CommandContext, Permission } from './command';

export default class LockCommand implements Command {
  precondition: Permission = 'MANAGE_CHANNELS';
  name = 'lock';
  summary = 'Stop messages in the current channel.';
  cooldown = 5;
  module = 'Auto-mod';
  
  execute = async(ctx: CommandContext) => {
    ctx.channel.overwritePermissions([
      {
        id: ctx.guild.roles.everyone.id,
        type: 'role',
        deny: ['SEND_MESSAGES'],
      },
    ], 'Channel locked');

    return ctx.channel.send(`🔒 Locked <#${ctx.channel.id}>`);
  };
}
