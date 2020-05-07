import { MessageValidationMetadata, SavedLog } from "../../../../models/log";
import { MessageFilter, SavedGuild } from "../../../../models/guild";
import { expect } from "chai";
import MessageHandler from "../../../../services/handlers/message.handler";
import { ValidationError } from "../../../../modules/auto-mod/auto-mod";
import CommandService from "../../../../services/command.service";
import { mock } from "ts-mockito";
import Guilds from "../../../../data/guilds";
import Leveling from "../../../../modules/xp/leveling";
import Logs from "../../../../data/logs";

describe('services/handlers/message.handler', () => {
    let validation = null;
    let handler: MessageHandler;
    let autoMod: any, commandService: any, guilds: any, leveling: any, logs: any;

    beforeEach(() => {
        autoMod = {
            validateMsg: () => {}
        }
        commandService = {
            handle: () => false
        }
        guilds = {
            get: () => new SavedGuild()
        }
        leveling = {
            validateXPMsg: () => { throw new Error(); }
        }
        logs = {
            logMessage: (msg, v) => validation = v
        }

        handler = new MessageHandler(
            autoMod,
            commandService,
            guilds,
            leveling,
            logs);
    });

    it('auto mod throws with filter, validation logged', async() => {
        const expected: MessageValidationMetadata = {
            earnedXP: false,
            filter = MessageFilter.Emoji
        };

        autoMod.validateMsg = () => { throw new ValidationError('', MessageFilter.Emoji); }

        await handler.invoke({ author: {} } as any);

        expect(validation).to.deep.equal(expected);
    });

    it('auto mod does not throw with filter and does not earn XP, validation logged', async() => {
        const expected: MessageValidationMetadata = {
            earnedXP: false,
            filter: undefined
        };

        autoMod.validateMsg = () => {}

        await handler.invoke({ author: {} } as any);

        expect(validation).to.deep.equal(expected);
    });

    it('auto mod does not throw with filter and earns XP, validation logged', async() => {
        const expected: MessageValidationMetadata = {
            earnedXP: true,
            filter: undefined
        };

        autoMod.validateMsg = () => {}
        leveling.validateXPMsg = () => {}

        await handler.invoke({ author: {} } as any);

        expect(validation).to.deep.equal(expected);
    });
});