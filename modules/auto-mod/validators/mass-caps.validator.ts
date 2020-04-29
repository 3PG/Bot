import { GuildDocument } from '../../../models/guild';
import { ContentValidator } from './content-validator';

export class MassCapsValidator implements ContentValidator {
    validate(content: string, guild: GuildDocument) {
        const pattern = /[A-Z]/g;
        const severity = guild.autoMod.filterThreshold;
        
        const invalid = (content.match(pattern)?.length / content.length) >= (severity / 10);
        if (invalid)
            throw new TypeError('Message contains too many mentions.');
    }
}