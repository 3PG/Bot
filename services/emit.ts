import { emitter } from '../bot';
import { Guild, User, GuildMember } from 'discord.js';
import { PunishmentArgs } from '../modules/auto-mod/auto-mod';
import { MemberDocument } from '../data/models/member';

export default class Emit {
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
}

export interface PunishmentEventArgs {
    until?: Date;
    guild: Guild;
    user: User;
    instigator: User;
    warnings: number;
    reason: string;
}