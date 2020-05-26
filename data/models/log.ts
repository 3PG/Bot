import { model, Schema, Document } from 'mongoose';
import { MessageFilter } from './guild';

export class Change {
    public at = new Date();

    constructor(
        public by: string,
        public changes: { old: {}, new: {}},
        public module: string) {}
}

export interface CommandLog {
    name: string,
    by: string,
    at: Date
}

export interface MessageLog {
    at: Date;
    validation: MessageValidationMetadata;
}

export interface MessageValidationMetadata {
    earnedXP: boolean;
    filter?: MessageFilter | null;    
}

const LogSchema = new Schema({
    _id: String,
    changes: { type: Array, default: [] },
    commands: { type: Array, default: [] },
    messages: { type: Array, default: [] }
});

export interface LogDocument extends Document {
    _id: string;
    changes: Change[];
    commands: CommandLog[];
    messages: MessageLog[];
}

export const SavedLog = model<LogDocument>('log', LogSchema);