import { Guild, Message } from 'discord.js';
import DBWrapper from './db-wrapper';
import { LogDocument, SavedLog, MessageValidationMetadata, Change } from '../data/models/log';
import { Command } from '../commands/command';

export default class Logs extends DBWrapper<Guild, LogDocument> {
    protected async getOrCreate(guild: Guild) {
        const log = await SavedLog.findById(guild.id) ?? await this.create(guild);

        log.changes = log.changes.slice(log.changes.length - 100);

        return log;
    }

    protected async create(guild: Guild) {
        return new SavedLog({ _id: guild.id }).save();
    }

    async logChanges(change: Change, guild: Guild) {
        const log = await this.get(guild);
        log.changes.push(change);
        return log.save();
    }
    
    async logCommand(msg: Message, command: Command) {
        const log = await this.get(msg.guild);
        if (log.__v > 1000) return;
        
        log.commands.push({
            at: new Date(),
            by: msg.author.id,
            name: command.name
        });
        return log.save();
    }

    async logMessage(msg: Message, validation: MessageValidationMetadata) {
        const log = await this.get(msg.guild);

        log.messages.push({ at: new Date(), validation });   
        return log.save();
    }

    async getAll() {
        return await SavedLog.find();
    }
}