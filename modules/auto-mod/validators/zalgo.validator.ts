import { GuildDocument } from '../../../models/guild';
import { ContentValidator } from './content-validator';

export class ZalgoValidator implements ContentValidator {
    validate(content: string, guild: GuildDocument) {
        const pattern = /([^\0009\02b7\2000\20bf\2122\0308]|(?![^aeiouy])\0308)/gm;
        
        const invalid = content.match(pattern);
        if (invalid)
            throw new TypeError('Message contains zalgo.');
    }
}