import { Guild } from 'discord.js';
import { GuildDocument, SavedGuild } from '../data/models/guild';
import DBWrapper from './db-wrapper';

export default class Guilds extends DBWrapper<Guild, GuildDocument> {
    protected async getOrCreate(guild: Guild) {
        if (!guild) return null;

        const savedGuild = await SavedGuild.findById(guild.id);
        return savedGuild ?? this.create(guild);
    }

    protected create(guild: Guild) {
        return new SavedGuild({ _id: guild.id }).save();
    }
}