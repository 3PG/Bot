import { Command, CommandContext, Permission } from './command';
import { MessageEmbed } from 'discord.js';
import { getRoleFromMention } from '../utils/command-utils';

export default class RoleCommand implements Command {
  precondition: Permission = '';
  name = 'role';
  summary = 'Get info about a specific role';
  cooldown = 1;
  usage = 'role [role]';
  module = 'General';
  
  execute = async(ctx: CommandContext, roleMention: string) => {
    const role = getRoleFromMention(roleMention, ctx.guild);
    
    const emojiBoolean = (condition) => condition ? '✅' : '❌';

    return ctx.channel.send(new MessageEmbed({
      color: role.color,
      title: `@${role.name}`,
      fields: [
        { name: 'ID', value: `\`${role.id}\``, inline: true },
        { name: 'Created', value: `\`${role.createdAt.toDateString()}\``, inline: true },
        { name: 'Position', value: `\`${role.position}\``, inline: true },
        { name: 'Members', value: `\`${role.members.size}\``, inline: true },
        { name: 'Mentionable', value: emojiBoolean(role.mentionable), inline: true },
        { name: 'Hoisted', value: emojiBoolean(role.hoist), inline: true },
        { name: 'Managed', value: emojiBoolean(role.managed), inline: true },
      ]
    }).setThumbnail(ctx.guild.iconURL()));
  }
}
