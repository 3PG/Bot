import { emitter } from '../bot';
import { Guild, User, GuildMember, Message } from 'discord.js';
import { PunishmentArgs } from '../modules/auto-mod/auto-mod';
import { MemberDocument } from '../data/models/member';
import { Change } from '../data/models/log';

/**
 * Used for emitting custom events.
 */
export default class Emit {
    configSaved(guild: Guild, user: User, change: Change) {
        const eventArgs: ConfigUpdateArgs = {
            guild,
            instigator: user,
            module: change.module,
            new: change.changes.new,
            old: change.changes.old
        };
        emitter.emit('configUpdate', eventArgs);
    }

    levelUp(args: { newLevel: number, oldLevel: number }, msg: Message, savedMember: MemberDocument) {
        const eventArgs: LevelUpEventArgs = {
            ...args,
            guild: msg.guild,
            xp: savedMember.xp,
            user: msg.member.user
        };        
        emitter.emit('levelUp', eventArgs);
    }

    mute(args: PunishmentArgs, target: GuildMember, savedMember: MemberDocument) {
        const eventArgs: PunishmentEventArgs = {
            ...args,
            guild: target.guild,
            user: target.user,
            warnings: savedMember.warnings.length
        };
        emitter.emit('userMute', eventArgs);
    }

    unmute(args: PunishmentArgs, target: GuildMember, savedMember: MemberDocument) {
        const eventArgs: PunishmentEventArgs = {
            guild: target.guild,
            instigator: args.instigator,
            user: target.user,
            reason: args.reason,
            warnings: savedMember.warnings.length
        };
        emitter.emit('userUnmute', eventArgs);    
    }

    warning(args: PunishmentArgs, target: GuildMember, savedMember: MemberDocument) {
        const eventArgs: PunishmentEventArgs = {
            ...args,
            guild: target.guild,
            reason: args.reason,
            user: target.user,
            warnings: savedMember.warnings.length
        }
        emitter.emit('userWarn', eventArgs);
    }
}

export interface ConfigUpdateArgs {
    guild: Guild;
    instigator: User;
    module: string;
    new: any;
    old: any;
}

export interface LevelUpEventArgs {
    guild: Guild;
    newLevel: number;
    oldLevel: number;
    xp: number;
    user: User;
}

export interface PunishmentEventArgs {
    until?: Date;
    guild: Guild;
    user: User;
    instigator: User;
    warnings: number;
    reason: string;
}