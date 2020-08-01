import { expect, use } from 'chai';
import { GuildDocument, MessageFilter } from '../../../../data/models/guild';
import { mock } from 'ts-mockito';
import AutoMod from '../../../../modules/auto-mod/auto-mod';
import { Message } from 'discord.js';
import { SavedMember } from '../../../../data/models/member';
import Members from '../../../../data/members';
import Deps from '../../../../utils/deps';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

describe('modules/auto-mod', () => {
    let autoMod: AutoMod;
    let emit: any;
    let members: any;

    beforeEach(() => {
        Deps.testing = true;

        members = mock<Members>();
        members.get = (): any => new SavedMember();
        
        autoMod = new AutoMod(emit, members);
    });
    
    describe('validate', () => {
        it('contains ban word, has filter, error thrown', async() => {            
            const guild = mock<GuildDocument>();
            const msg = mock<Message>();

            guild.autoMod.filters = [MessageFilter.Words];
            guild.autoMod.banWords = ['a'];
            msg.content = 'a';
            
            const result = () => autoMod.validate(msg, guild);

            return expect(result()).to.be.rejected;
        });
        
        it('contains ban word, has filter, auto deleted, error thrown', async() => {            
            const guild = mock<GuildDocument>();
            const msg = mock<Message>();

            guild.autoMod.filters = [MessageFilter.Words];
            guild.autoMod.banWords = ['a'];
            msg.content = 'a';
            msg.delete = () => { throw new TypeError('deleted'); }

            const result = () => autoMod.validate(msg, guild);

            return expect(result()).to.be.rejected;
        });

        it('contains ban word, no filter, ignored', async() => {
            const guild = mock<GuildDocument>();
            const msg = mock<Message>();

            guild.autoMod.filters = [];
            guild.autoMod.banWords = [];
            msg.content = 'a';

            const result = () => autoMod.validate(msg, guild);

            return expect(result()).to.not.be.rejected;
        });
        
        it('contains ban link, has filter, error thrown', async() => {            
            const guild = mock<GuildDocument>();
            const msg = mock<Message>();
            
            guild.autoMod.filters = [MessageFilter.Links];
            guild.autoMod.banLinks = ['a'];
            msg.content = 'a';

            const result = () => autoMod.validate(msg, guild);

            return expect(result()).to.be.rejected;
        });
        
        it('contains ban link, no filter, ignored', async() => {            
            const guild = mock<GuildDocument>();
            const msg = mock<Message>();

            guild.autoMod.filters = [];
            guild.autoMod.banLinks = ['a'];
            msg.content = 'a';

            const result = () => autoMod.validate(msg, guild);

            return expect(result()).to.be.fulfilled;
        });
    });

    describe('warnMember', () => {
        it('warn self member, error thrown', async() => {
            const member: any = { id: '123', user: { bot: false } };
            const instigator: any = { id: '123' };

            const result = () => autoMod.warn(member, instigator);

            return expect(result()).to.be.rejected;
        });

        it('warn bot member, error thrown', async() => {
            const member: any = { id: '123', user: { bot: true }};
            const instigator: any = { id: '321' };

            const result = () => autoMod.warn(member, instigator);

            return expect(result()).to.be.rejected;
        });
    });
});