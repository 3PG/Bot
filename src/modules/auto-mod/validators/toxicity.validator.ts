import { GuildDocument, MessageFilter } from '../../../data/models/guild';
import { ContentValidator } from './content-validator';
import { ValidationError } from '../auto-mod';
import toxicity from '@tensorflow-models/toxicity';

export default class EmojiValidator implements ContentValidator {
  filter = MessageFilter.Toxicity;

  async validate(content: string, savedGuild: GuildDocument) {
    const severity = savedGuild.autoMod.filterThreshold;

    console.time('load model');
    const model = await toxicity.load(severity / 10, null);
    console.timeEnd('load model');
    
    const predictions = await model.classify(content);
    const match = predictions.find(p => p.results.some(r => r.match));
    if (match)
      throw new ValidationError(`Message was flagged for ${match.label}.`, this.filter);
  }
}
