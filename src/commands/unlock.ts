import { Command, CommandContext, Permission } from './command';

export default class UnlockCommand implements Command {
  precondition: Permission = 'MANAGE_CHANNELS';
  name = 'unlock';
  summary = 'Allow messages in the current channel.';
  cooldown = 5;
  module = 'Auto-mod';
  
  execute = async(ctx: CommandContext) => {    
    ctx.channel.overwritePermissions([
      {
        id: ctx.guild.roles.everyone.id,
        type: 'role',
        allow: ['SEND_MESSAGES'],
      },
    ], 'Channel unlocked');

    return ctx.channel.send(`🔓 Unlocked <#${ctx.channel.id}>`);
  };
}
