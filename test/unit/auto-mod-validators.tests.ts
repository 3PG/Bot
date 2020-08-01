import { SavedGuild, GuildDocument, MessageFilter } from '../../src/data/models/guild';
import { Message } from 'discord.js';
import { expect } from 'chai';
import EmojiValidator from '../../src/modules/auto-mod/validators/emoji.validator';
import MassMentionValidator from '../../src/modules/auto-mod/validators/mass-mention.validator';
import MassCapsValidator from '../../src/modules/auto-mod/validators/mass-caps.validator';
import ZalgoValidator from '../../src/modules/auto-mod/validators/zalgo.validator';

describe('auto-mod/validators', () => {
    let guild: GuildDocument;
    beforeEach(() => guild = new SavedGuild());

    describe('emoji validator', () => {
        it('no emojis, does not throw', () => {
            const validator = new EmojiValidator();

            const result = () => validator.validate('', guild);

            expect(result).to.not.throw();
        });
        it('nearly too many emojis, does not throw', () => {
            const validator = new EmojiValidator();

            const result = () => validator.validate('🤔🤔🤔🤔', guild);

            expect(result).to.not.throw();
        });
        it('too many emojis, throws error', () => {
            const validator = new EmojiValidator();

            const result = () => validator.validate('🤔🤔🤔🤔🤔', guild);

            expect(result).to.throw();
        });
    });

    describe('mass mention validator', () => {
        it('no mentions, does not throw', () => {
            const validator = new MassMentionValidator();

            const result = () => validator.validate('', guild);

            expect(result).to.not.throw();
        });
        it('nearly too many mentions, does not throw', () => {
            const validator = new MassMentionValidator();

            const result = () => validator.validate('<@!704656805208522833><@!704656805208522833><@!704656805208522833><@!704656805208522833>', guild);

            expect(result).to.not.throw();
        });
        it('too many mentions, throws error', () => {
            const validator = new MassMentionValidator();

            const result = () => validator.validate('<@!704656805208522833><@!704656805208522833><@!704656805208522833><@!704656805208522833><@!704656805208522833>', guild);

            expect(result).to.throw();
        });
    });

    describe('all caps validator', () => {
        it('no caps, does not throw', () => {
            const validator = new MassCapsValidator();

            const result = () => validator.validate('a', guild);

            expect(result).to.not.throw();
        });
        it('nearly too many caps, does not throw', () => {
            const validator = new MassCapsValidator();

            const result = () => validator.validate('AAAAaaaaaa', guild);

            expect(result).to.not.throw();
        });
        it('too many caps, throws error', () => {
            const validator = new MassCapsValidator();

            const result = () => validator.validate('AAaa', guild);

            expect(result).to.throw();
        });
    });

    describe('zalgo validator', () => {
        it('no zalgo, does not throw', () => {
            const validator = new ZalgoValidator();

            const result = () => validator.validate('a 🤔', guild);

            expect(result).to.not.throw();
        });
        it('zalgo, throws error', () => {
            const validator = new ZalgoValidator();

            const result = () => validator.validate('a̵͎̟̻̟̺͇̭͚͇̳̔̍͊̈́̀̕͝', guild);

            expect(result).to.throw();
        });
    });
});