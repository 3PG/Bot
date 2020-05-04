import { GuildDocument, MessageFilter } from '../../../models/guild';
import { ContentValidator } from './content-validator';

export class EmojiValidator implements ContentValidator {
    filter: MessageFilter.Emoji;

    validate(content: string, guild: GuildDocument) {
        const pattern = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gm;
        const severity = guild.autoMod.filterThreshold;
        
        const invalid = content.match(pattern)?.length >= severity;
        if (invalid)
            throw new TypeError('Message contains too many emojis.');
    }
}