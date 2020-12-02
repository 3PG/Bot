import { GuildDocument, MessageFilter } from '../../../data/models/guild';
import { ContentValidator } from './content-validator';
import { ValidationError, explicitWords } from '../auto-mod';

export default class ExplicitWordValidator implements ContentValidator {
  filter = MessageFilter.ExplicitWords;

  async validate(content: string, guild: GuildDocument) {    
    const msgWords = content.split(' ');
    for (const word of msgWords) {
      const isExplicit = explicitWords
        .some(w => w.toLowerCase() === word.toLowerCase());      
      if (isExplicit)
        throw new ValidationError('Message contains banned words.', this.filter);
    }
  }
}