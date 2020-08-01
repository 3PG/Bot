import { SavedGuild, GuildDocument } from '../../src/data/models/guild';
import Validators from '../../src/services/validators';
import { Command } from '../../src/commands/command';
import PingCommand from '../../src/commands/ping';
import { GuildMember, Message } from 'discord.js';
import { mock } from 'ts-mockito';
import { expect } from 'chai';

describe('services/validators', () => {
    let command: Command;
    let member: GuildMember;
    let msg: Message;
    let savedGuild: GuildDocument;
    let validators: Validators;

    beforeEach(() => {
        command = new PingCommand();
        savedGuild = new SavedGuild();
        savedGuild.commands.configs = [];
        
        member = mock<GuildMember>();
        msg = { member } as any;
        validators = new Validators();
    });

    describe('check command', () => {
        it('no config, does not throw', () => {
            const result = () => validators.checkCommand(command, savedGuild, msg);

            expect(result).to.not.throw();
        });

        it('config not enabled, error thrown', () => {
            savedGuild.commands.configs.push({
                name: 'ping',
                enabled: false,
                channels: [],
                roles: []
            });

            const result = () => validators.checkCommand(command, savedGuild, msg);

            expect(result).to.throw();
        });

        it('role is whitelisted, does not throw', () => {
            msg = { member: { roles: { cache: { get: (id) => '123', has: (id) => true }}}} as any;
            
            savedGuild.commands.configs.push({
                name: 'ping',
                enabled: true,
                channels: [],
                roles: ['123']
            });

            const result = () => validators.checkCommand(command, savedGuild, msg);

            expect(result).to.not.throw();
        });

        it('role is not whitelisted, throws error', () => {
            msg = { member: { roles: { cache: { get: (id) => '321', has: (id) => false }}}} as any;

            savedGuild.commands.configs.push({
                name: 'ping',
                enabled: true,
                channels: [],
                roles: ['123']
            });

            const result = () => validators.checkCommand(command, savedGuild, msg);

            expect(result).to.throw();
        });

        it('channel is whitelisted, does not throw', () => {
            msg = { member: { roles: { cache: { get: (id) => '321', has: (id) => false }}}, channel: { id: '123' }} as any;

            savedGuild.commands.configs.push({
                name: 'ping',
                enabled: true,
                channels: ['123'],
                roles: []
            });

            const result = () => validators.checkCommand(command, savedGuild, msg);

            expect(result).to.not.throw();
        });

        it('channel not whitelisted, throws error', () => {
            msg = { member: { roles: { cache: { get: (id) => '321', has: (id) => false }}}, channel: { id: '321' }} as any;

            savedGuild.commands.configs.push({
                name: 'ping',
                enabled: true,
                channels: ['123'],
                roles: []
            });

            const result = () => validators.checkCommand(command, savedGuild, msg);

            expect(result).to.throw();
        });
    });

    describe('check preconditions', () => {
        it('no command precondition, does not throw', () => {
            const result = () => validators.checkPreconditions(command, member);

            expect(result).to.not.throw();
        });

        it('met precondition, does not throw', () => {
            command = { precondition: 'BAN_MEMBERS' } as any;
            member = { hasPermission: () => true } as any;

            const result = () => validators.checkPreconditions(command, member);

            expect(result).to.not.throw();
        });

        it('unmet precondition, throws error', () => {
            command = { precondition: 'BAN_MEMBERS' } as any;
            member = { hasPermission: () => false } as any;

            const result = () => validators.checkPreconditions(command, member);

            expect(result).to.throw();
        });
    });

    describe('check channel', () => {
        it('channel not ignored, does not throw', () => {
            const channel = { id: '123' } as any;

            const result = () => validators.checkChannel(channel, savedGuild);

            expect(result).to.not.throw();            
        });

        it('channel ignored, throws error', () => {
            savedGuild.general.ignoredChannels = ['123'];
            const channel = { id: '123' } as any;

            const result = () => validators.checkChannel(channel, savedGuild);

            expect(result).to.throw();            
        });
    });
});
