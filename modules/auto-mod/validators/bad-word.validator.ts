import { GuildDocument, MessageFilter } from '../../../models/guild';
import { ContentValidator } from './content-validator';

export class BadWordValidator implements ContentValidator {
    filter: MessageFilter.Words;

    validate(content: string, guild: GuildDocument) {
        const msgWords = content.split(' ');
        for (const word of msgWords) {
            const isExplicit = guild.autoMod.banWords
                .some(w => w.toLowerCase() === word.toLowerCase());
            if (isExplicit) {
                throw new TypeError('Message contains banned words.');
            }
        }
    }
}