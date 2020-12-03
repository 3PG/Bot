import { GuildDocument, MessageFilter } from '../../../data/models/guild';
import { ContentValidator } from './content-validator';
import { ValidationError } from '../auto-mod';

export default class EmojiValidator implements ContentValidator {
  filter = MessageFilter.Toxicity;

  async validate(content: string, savedGuild: GuildDocument) {
    // const severity = savedGuild.autoMod.filterThreshold;
    
    // const predictions =  await model.classify(content);
    // const match = false;//predictions.find(p => p.results.some(r => r.match));
    // if (match)
    //   throw new ValidationError(`Message was flagged for ${match.label}.`, this.filter);
  }
}
