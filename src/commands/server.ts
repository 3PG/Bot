import { Command, CommandContext, Permission } from './command';
import { MessageEmbed } from 'discord.js';

export default class ServerCommand implements Command {
  precondition: Permission = '';
  name = 'server';
  summary = 'Get stats about your server';
  cooldown = 1;
  module = 'General';
  
  execute = async(ctx: CommandContext) => {
    return ctx.channel.send(new MessageEmbed({
      title: `**__${ctx.guild.name}__**`,
      fields: [
        { name: 'Channels', value: `\`${ctx.guild.channels.cache.size}\``, inline: true },
        { name: 'Created', value: `\`${ctx.guild.createdAt.toDateString()}\``,  inline: true },
        { name: 'ID', value: `\`${ctx.guild.id}\``, inline: true },
        { name: 'Members', value: `\`${ctx.guild.members.cache.size}\``, inline: true },
        { name: 'Owner', value: `<@!${ctx.guild.ownerID}>`, inline: true },
        { name: 'Roles', value: `\`${ctx.guild.roles.cache.size}\``, inline: true }
      ],
      
    }).setThumbnail(ctx.guild.iconURL()));
  }
}
