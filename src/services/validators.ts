import { Command, Permission } from '../commands/command';
import { GuildMember, TextChannel, Message } from 'discord.js';
import { GuildDocument, CustomCommand } from '../data/models/guild';

export default class Validators {
  checkCommand(command: Command, guild: GuildDocument, msg: Message) {
    const config = guild.commands.configs.find(c => c.name === command.name);
    if (!config) return;

    if (!config.enabled)
      throw new TypeError('Command not enabled!');
    
    const hasWhitelistedRole = config.roles?.some(id => msg.member.roles.cache.has(id));
    if (config.roles?.length > 0 && !hasWhitelistedRole)
      throw new TypeError(`You don't have the role to execute this command.`);

    const inWhitelistedChannel = config.channels
      ?.some(id => msg.channel.id === id);
    if (config.channels.length > 0 && !inWhitelistedChannel)
      throw new TypeError(`Command cannot be executed in this channel.`);
  }

  checkPreconditions(command: Command, executor: GuildMember) {
    if (command.precondition && !executor.hasPermission(command.precondition as any))
      throw new TypeError(`**Required Permission**: \`${command.precondition}\``);
  }

  checkChannel(channel: TextChannel, savedGuild: GuildDocument, customCommand?: CustomCommand) {
    const isIgnored = savedGuild.general.ignoredChannels
      .some(id => id === channel.id);

    if (isIgnored && !customCommand)
      throw new TypeError('Commands cannot be executed in this channel.');
    else if (isIgnored && !customCommand.anywhere)
      throw new TypeError('This custom command cannot be executed in this channel.');
  }
}