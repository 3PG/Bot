import { model, Schema, Document } from 'mongoose';

export class Module {
    enabled = true;
}

export class LogsModule extends Module {
    events: LogEvent[] = [
        {
            enabled: true,
            event: EventType.LevelUp,
            channel: '',
            message: `**Level UP** :sparkles:
            [USER] - **[XP]XP**
           LVL \`[OLD_LEVEL]\` -> \`[NEW_LEVEL]\``
        }
    ];
}

export enum EventType {
    Ban = 'BAN', 
    ConfigUpdate = 'CONFIG_UPDATE',
    LevelUp = 'LEVEL_UP',
    MessageDeleted = 'MESSAGE_DELETED',
    MemberJoin = 'MEMBER_JOIN',
    MemberLeave = 'MEMBER_LEAVE',
    Mute = 'MUTE',
    Unban = 'UNBAN',
    Unmute = 'UNMUTE',
    Warn ='WARN',
}

export interface LogEvent {
    enabled: boolean;
    event: EventType;
    channel: string;
    message: string;
}

export class AutoModModule extends Module {
    ignoredRoles: string[] = [];
    autoDeleteMessages = true;
    filters: MessageFilter[] = [];
    banWords: string[] = [];
    banLinks: string[] = [];
    filterThreshold = 5;
    autoWarnUsers = true;
}

export class CommandsModule extends Module {
    configs: CommandConfig[] = [];
    custom: CustomCommand[] = [];
}
export interface CommandConfig {
    name: string;
    roles: string[];
    channels: string[];
    enabled: boolean;
}
export interface CustomCommand {
    alias: string;
    anywhere: boolean;
    command: string;
}

export enum MessageFilter {
    Emoji = 'EMOJI', 
    ExplicitWords = 'EXPLICIT_WORDS',
    Links = 'LINKS',
    MassCaps = 'MASS_CAPS',
    MassMention = 'MASS_MENTION',
    Words = 'WORDS',
    Zalgo = 'ZALGO'
}

export class GeneralModule extends Module {
    prefix = '.';
    ignoredChannels: string[] = [];
    autoRoles: string[] = [];
}

export class TimersModule extends Module {
    commandTimers: CommandTimer[] = [];
    messageTimers: MessageTimer[] = [];
}

export interface Timer {
    enabled: boolean;
    interval: string;
    from: Date;
}
export interface CommandTimer extends Timer {
    channel: string;
    command: string;
}
export interface MessageTimer extends Timer {
    channel: string;
    message: string;
}

export class LevelingModule extends Module {
    levelRoles: LevelRole[] = [];
    ignoredRoles: string[] = [];
    xpPerMessage = 50;
    maxMessagesPerMinute = 3;
}
export interface LevelRole {
    level: number;
    role: string;
}

export class MusicModule extends Module {
    maxTrackLength = 24;
}

export class ReactionRolesModule extends Module {
    configs: ReactionRole[] = [];
}
export interface ReactionRole {
    channel: string,
    messageId: string,
    emote: string,
    role: string
}

export class DashboardSettings {
    privateLeaderboard = false;
}

export interface GuildDocument extends Document {
    _id: string;
    autoMod: AutoModModule;
    commands: CommandsModule;
    general: GeneralModule;
    leveling: LevelingModule;
    logs: LogsModule;
    music: MusicModule;
    reactionRoles: ReactionRolesModule;
    timers: TimersModule;
    settings: DashboardSettings;
}

export const SavedGuild = model<GuildDocument>('guild', new Schema({
    _id: String,
    autoMod: { type: Object, default: new AutoModModule() }, 
    commands: { type: Object, default: new CommandsModule() },
    general: { type: Object, default: new GeneralModule() },
    leveling: { type: Object, default: new LevelingModule() },
    logs: { type: Object, default: new LogsModule() }, 
    timers: { type: Object, default: new TimersModule() },
    music: { type: Object, default: new MusicModule() },
    reactionRoles: { type: Object, default: new ReactionRolesModule() },
    settings: { type: Object, default: new DashboardSettings() }
}));
