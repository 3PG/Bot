import { Guild, User, GuildMember, Message } from 'discord.js';
import { PunishmentArgs } from '../modules/auto-mod/auto-mod';
import { MemberDocument } from '../data/models/member';
import { Change } from '../data/models/log';
import Deps from '../utils/deps';
import { EventEmitter } from 'events';

/**
 * Used for emitting custom events.
 */
export default class Emit {
  constructor(private emitter = Deps.get<EventEmitter>(EventEmitter)) {}

  configSaved(guild: Guild, user: User | any, change: Change) {
    const eventArgs: ConfigUpdateArgs = {
      guild,
      instigator: user,
      module: change.module,
      new: change.changes.new,
      old: change.changes.old
    };
    this.emitter.emit('configUpdate', eventArgs);
  }

  levelUp(args: { newLevel: number, oldLevel: number }, msg: Message, savedMember: MemberDocument) {
    const eventArgs: LevelUpEventArgs = {
      ...args,
      guild: msg.guild,
      xp: savedMember.xp,
      user: msg.member.user
    };    
    this.emitter.emit('levelUp', eventArgs);
  }

  mute(args: PunishmentArgs, target: GuildMember, savedMember: MemberDocument) {
    const eventArgs: PunishmentEventArgs = {
      ...args,
      guild: target.guild,
      user: target.user,
      warnings: savedMember.warnings.length
    };
    this.emitter.emit('userMute', eventArgs);
  }

  unmute(args: PunishmentArgs, target: GuildMember, savedMember: MemberDocument) {
    const eventArgs: PunishmentEventArgs = {
      guild: target.guild,
      instigator: args.instigator,
      user: target.user,
      reason: args.reason,
      warnings: savedMember.warnings.length
    };
    this.emitter.emit('userUnmute', eventArgs);  
  }

  warning(args: PunishmentArgs, target: GuildMember, savedMember: MemberDocument) {
    const eventArgs: PunishmentEventArgs = {
      ...args,
      guild: target.guild,
      reason: args.reason,
      user: target.user,
      warnings: savedMember.warnings.length
    }
    this.emitter.emit('userWarn', eventArgs);
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