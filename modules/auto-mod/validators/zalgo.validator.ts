import { GuildDocument } from '../../../models/guild';
import { ContentValidator } from './content-validator';

export class ZalgoValidator implements ContentValidator {
    validate(content: string, guild: GuildDocument) {
        const pattern = /%CC%/g;
        
        const invalid = pattern.test(encodeURIComponent(content))
        if (invalid)
            throw new TypeError('Message contains zalgo.');
    }
}