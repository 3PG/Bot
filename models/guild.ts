import { model, Schema, Document } from 'mongoose';

export class Module {
    enabled = true;
}

export class AnnounceModule extends Module {
    events: AnnounceEvent[] = [
        {
            event: EventType.LevelUp,
            channel: '',
            message: `**Level UP** :sparkles:
            [USER] - **[XP]XP**
           LVL \`[OLD_LEVEL]\` -> \`[NEW_LEVEL]\``
        }
    ];
}

export enum EventType {
    Ban = "BAN", 
    ConfigUpdate = "CONFIG_UPDATE",
    LevelUp = "LEVEL_UP",
    MessageDeleted = "MESSAGE_DELETED",
    MemberJoin = "MEMBER_JOIN",
    MemberLeave = "MEMBER_LEAVE",
    Unban = "UNBAN", 
    Warn ="WARN"
  }

export interface AnnounceEvent {
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
}

export enum MessageFilter { Words, Links, Emoji, MassMention, MassCaps, Zalgo }

export class GeneralModule extends Module {
    prefix = '.';
    ignoredChannels: string[] = [];
    autoRoles: string[] = [];
    reactionRoles: ReactionRole[] = [];
}

export interface ReactionRole {
    channel: string,
    messageId: string,
    emote: string,
    role: string
}

export class XPModule extends Module {
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
    
}

export interface CommandConfig {
    name: string;
    roles: string[];
    channels: string[];
    enabled: boolean;
}

export class DashboardSettings {
    privateLeaderboard = false;
}

const guildSchema = new Schema({
    _id: String,
    announce: { type: Object, default: new AnnounceModule() }, 
    autoMod: { type: Object, default: new AutoModModule() }, 
    commands: { type: Object, default: new CommandsModule() },
    general: { type: Object, default: new GeneralModule() },
    music: { type: Object, default: new MusicModule },
    xp: { type: Object, default: new XPModule() },
    settings: { type: Object, default: new DashboardSettings() }
});

export interface GuildDocument extends Document {
    _id: string;
    announce: AnnounceModule;
    autoMod: AutoModModule;
    general: GeneralModule;
    music: MusicModule;
    xp: XPModule;
    commands: CommandsModule;
    settings: DashboardSettings;
}

export const SavedGuild = model<GuildDocument>('guild', guildSchema);
