import { GuildDocument } from '../../../models/guild';
import { ContentValidator } from './content-validator';

export class ZalgoValidator implements ContentValidator {
    validate(content: string, guild: GuildDocument) {
        const pattern = /([^\u0009-\u02b7\u2000-\u20bf\u2122\u0308]|(?![^aeiouy])\u0308)/gm;
        
        const invalid = content.match(pattern);
        if (invalid)
            throw new TypeError('Message contains zalgo.');
    }
}