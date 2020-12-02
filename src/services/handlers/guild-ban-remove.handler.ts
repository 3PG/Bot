import LogsHandler from './logs-handler';
import { Guild, User, ClientEvents } from 'discord.js';
import { EventType } from '../../data/models/guild';
import EventVariables from '../../modules/announce/event-variables';

export default class GuildBanAddHandler extends LogsHandler {
  on: keyof ClientEvents = 'guildBanRemove';
  event = EventType.Unban;

  async invoke(guild: Guild, user: User) {
    await super.announce(guild, [ guild, user ]);
  }
  
  protected async applyEventVariables(content: string, guild: Guild, user: User) {
    const ban = await guild.fetchBan(user);

    return new EventVariables(content)
      .guild(guild)
      .memberCount(guild)
      .reason(ban.reason)
      .user(user)
      .toString();
  }
}
