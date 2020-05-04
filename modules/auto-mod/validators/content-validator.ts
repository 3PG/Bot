import { GuildDocument, EventType, MessageFilter } from '../../../models/guild';

export interface ContentValidator {
    filter: MessageFilter;

    validate(content: string, guild: GuildDocument): void;
}