import EventHandler from './event-handler';
import { Guild, TextChannel, ClientEvents } from 'discord.js';
import Deps from '../../utils/deps';
import Guilds from '../../data/guilds';

export default class GuildCreateHandler implements EventHandler {
  on: keyof ClientEvents = 'guildCreate';

  constructor(private guilds = Deps.get<Guilds>(Guilds)) {}

  async invoke(guild: Guild): Promise<any> {
    await this.guilds.get(guild);
    this.sendWelcomeMessage(guild.systemChannel);
  }

  private sendWelcomeMessage(channel: TextChannel | null) {
    const url = `${process.env.DASHBOARD_URL}/servers/${channel.guild.id}`;
    channel?.send(`Hey, I'm 3PG! Customize me at ${url}`);
  }  
}