import { GuildDocument } from '../../../models/guild';
import { ContentValidator } from './content-validator';

export class MassMentionValidator implements ContentValidator {
    validate(content: string, guild: GuildDocument) {
        const pattern = /<@![0-9]{18}>/gm;
        const severity = guild.autoMod.filterThreshold;
        
        const invalid = content.match(pattern)?.length >= severity;
        if (invalid)
            throw new TypeError('Message contains too many mentions.');
    }
}