import { MessageValidationMetadata } from '../../../../data/models/log';
import { MessageFilter, SavedGuild } from '../../../../data/models/guild';
import { expect } from 'chai';
import MessageHandler from '../../../../services/handlers/message.handler';
import { ValidationError } from '../../../../modules/auto-mod/auto-mod';
import Mocks from '../../mocks';

describe('services/handlers/message.handler', () => {
    let msg: any;
    let validation = null;
    let handler: MessageHandler;
    let logs: any;
    let mocks: Mocks;

    beforeEach(() => {
        logs = {
            logMessage: (msg, v) => validation = v
        }

        mocks = new Mocks();

        handler = new MessageHandler(
            mocks.autoMod,
            mocks.commandService,
            mocks.guilds,
            mocks.leveling,
            logs);

        msg = { content: '', author: {} };
    });

    it('auto mod throws with filter, validation logged', async() => {
        const expected: MessageValidationMetadata = {
            earnedXP: false,
            filter: MessageFilter.Emoji
        };

        mocks.autoMod.validateMsg = () => { throw new ValidationError('', MessageFilter.Emoji); }        

        await handler.invoke(msg);

        expect(validation).to.deep.equal(expected);
    });

    it('auto mod does not throw with filter and does not earn XP, validation logged', async() => {
        const expected: MessageValidationMetadata = {
            earnedXP: false,
            filter: undefined
        };

        mocks.autoMod.validateMsg = () => {}

        await handler.invoke(msg);

        expect(validation).to.deep.equal(expected);
    });

    it('auto mod does not throw with filter and earns XP, validation logged', async() => {
        const expected: MessageValidationMetadata = {
            earnedXP: true,
            filter: undefined
        };

        mocks.autoMod.validateMsg = () => {}
        mocks.leveling.validateXPMsg = () => {}

        msg.content = 'testing';

        await handler.invoke(msg);

        expect(validation).to.deep.equal(expected);
    });
});