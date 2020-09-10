import { model, Schema, Document } from 'mongoose';
import { PermissionString } from 'discord.js';

export interface CommandDocument extends Document {
    aliases: string[];
    name: string;
    summary: string;
    module: string;
    usage: string;
    precondition?: PermissionString;
}

export const SavedCommand = model<CommandDocument>('command', new Schema({
    aliases: { type: Object, default: [] },
    name: String,
    summary: String,
    module: String,
    usage: String,
    precondition: String
}));