import { Guild, Message } from 'discord.js';
import DBWrapper from './db-wrapper';
import { LogDocument, SavedLog, MessageValidationMetadata, Change } from '../data/models/log';
import { Command } from '../commands/command';

export default class Logs extends DBWrapper<Guild, LogDocument> {
    protected async getOrCreate(guild: Guild) {
        const savedLog = await SavedLog.findById(guild.id);
        return savedLog ?? this.create(guild);
    }

    protected async create(guild: Guild) {
        return new SavedLog({ _id: guild.id }).save();
    }

    async logChanges(change: Change, guild: Guild) {
        const log = await this.get(guild);        
        log.changes.push(change);
        await this.save(log);
    }
    
    async logCommand(msg: Message, command: Command) {
        const log = await this.get(msg.guild);
        log.commands.push({
            at: new Date(),
            by: msg.author.id,
            name: command.name
        });
        await this.save(log);
    }

    async logMessage(msg: Message, validation: MessageValidationMetadata) {
        const log = await this.get(msg.guild);
        log.messages.push({ at: new Date(), validation });   
        await this.save(log);
    }
}