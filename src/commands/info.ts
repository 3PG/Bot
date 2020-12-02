import { Command, CommandContext, Permission } from './command';
import { MessageEmbed } from 'discord.js';

export default class InfoCommand implements Command {
  precondition: Permission = '';
  name = 'info';
  summary = 'Get stats about 3PG';
  cooldown = 1;
  module = 'General';
  
  execute = async(ctx: CommandContext) => {
    const uptimeHours = (ctx.bot.uptime / 1000 / 60 / 60).toFixed(2);

    return ctx.channel.send(new MessageEmbed({
      title: `**__${ctx.bot.user.tag} Info__**`,
      fields: [
        { name: 'Created', value: `\`${ctx.bot.user.createdAt.toDateString()}\``, inline: true },
        { name: 'Creator', value: `<@!${process.env.OWNER_ID}>`, inline: true },
        { name: 'ID', value: `\`${ctx.bot.user.id}\``, inline: true },
        { name: 'IQ', value: `\`1000\``,  inline: true },
        { name: 'Memes', value: `\`0\``, inline: true },
        { name: 'Shards', value: `\`${ctx.bot.shard?.count ?? 0}\``, inline: true },
        { name: 'Uptime', value: `\`${uptimeHours} hours\``, inline: true }
      ],
      
    }).setThumbnail(ctx.bot.user.avatarURL()));
  }
}
