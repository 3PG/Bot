import CommandService from '../../services/command.service';
import { SavedGuild, GuildDocument } from '../../../data/models/guild';
import { expect, use, assert } from 'chai';
import { bot } from '../../../src/bot';
import { Message } from 'discord.js';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

describe('command.service', () => {
    let msg: Message;
    let savedGuild: GuildDocument;
    let service: CommandService;

    beforeEach(async() => {
        savedGuild = new SavedGuild();
        service = new CommandService();
        await service.init();

        msg = {
            author: { bot: false },
            channel: {
                id: '234',
                send: (content) => { throw new TypeError(content); }
            },
            client: bot,
            content: '',
            guild: { id: '123' },
            member: {
                id: '321',
                hasPermission: () => false
            } 
        } as any;
    });

    it('too many commands are blocked by cooldown', async () => {
        let executions = 0;

        msg.content = '.ping';
        msg.channel.send = (): any => executions++;

        try {
            await service.handle(msg, savedGuild);
            await service.handle(msg, savedGuild);
        } finally {
            expect(executions).to.equal(1);
        }
    });

    describe('commands', () => {
        it('clear requires permission', async() => {
            msg.content = '.clear';

            const result = () => service.handle(msg, savedGuild);

            try {
                await result();
                throw new TypeError('No precondition error thrown');
            } catch (error) {
                if (!error.message.includes('Required Permission'))
                    throw new TypeError(error);
            }
        });
        it('warn requires permission', async() => {
            msg.content = '.warn';

            const result = () => service.handle(msg, savedGuild);

            try {
                await result();
                throw new TypeError('No precondition error thrown');
            } catch (error) {
                if (!error.message.includes('Required Permission'))
                    throw new TypeError(error);
            }
        });
        it('warnings requires permission', async() => {
            msg.content = '.warnings';

            const result = () => service.handle(msg, savedGuild);

            try {
                await result();
                throw new TypeError('No precondition error thrown');
            } catch (error) {
                if (!error.message.includes('Required Permission'))
                    throw new TypeError(error);
            }
        });
        it('mute requires permission', async() => {
            msg.content = '.mute';

            const result = () => service.handle(msg, savedGuild);

            try {
                await result();
                throw new TypeError('No precondition error thrown');
            } catch (error) {
                if (!error.message.includes('Required Permission'))
                    throw new TypeError(error);
            }
        });
        it('unmute requires permission', async() => {
            msg.content = '.unmute';

            const result = () => service.handle(msg, savedGuild);

            try {
                await result();
                throw new TypeError('No precondition error thrown');
            } catch (error) {
                if (!error.message.includes('Required Permission'))
                    throw new TypeError(error);
            }
        });
        it('lock requires permission', async() => {
            msg.content = '.lock';

            const result = () => service.handle(msg, savedGuild);

            try {
                await result();
                throw new TypeError('No precondition error thrown');
            } catch (error) {
                if (!error.message.includes('Required Permission'))
                    throw new TypeError(error);
            }
        });
        it('unlock requires permission', async() => {
            msg.content = '.unlock';

            const result = () => service.handle(msg, savedGuild);

            try {
                await result();
                throw new TypeError('No precondition error thrown');
            } catch (error) {
                if (!error.message.includes('Required Permission'))
                    throw new TypeError(error);
            }
        });
    });
});
