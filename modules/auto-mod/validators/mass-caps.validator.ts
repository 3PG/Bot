import { GuildDocument, MessageFilter } from '../../../models/guild';
import { ContentValidator } from './content-validator';

export class MassCapsValidator implements ContentValidator {
    filter: MessageFilter.MassCaps;

    validate(content: string, guild: GuildDocument) {
        const pattern = /[A-Z]/g;
        const severity = guild.autoMod.filterThreshold;
        
        const invalid = content.length > 5 
            && (content.match(pattern)?.length / content.length) >= (severity / 10);
        if (invalid)
            throw new TypeError('Message contains too many capital letters.');
    }
}