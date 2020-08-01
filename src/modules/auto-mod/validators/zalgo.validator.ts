import { GuildDocument, MessageFilter } from '../../../data/models/guild';
import { ContentValidator } from './content-validator';
import { ValidationError } from '../auto-mod';

export default class ZalgoValidator implements ContentValidator {
    filter = MessageFilter.Zalgo;

    validate(content: string, guild: GuildDocument) {
        const pattern = /%CC%/g;
        
        const invalid = pattern.test(encodeURIComponent(content))
        if (invalid)
            throw new ValidationError('Message contains zalgo.', this.filter);
    }
}