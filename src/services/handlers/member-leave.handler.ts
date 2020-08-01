import { GuildMember, TextChannel, ClientEvents } from 'discord.js';
import { EventType } from '../../data/models/guild';
import LogsHandler from './logs-handler';
import EventVariables from '../../modules/announce/event-variables';

export default class MemberLeaveHandler extends LogsHandler {
    on: keyof ClientEvents = 'guildMemberRemove';
    event = EventType.MemberLeave;

    async invoke(member: GuildMember) {
        await super.announce(member.guild, [ member ]);
    }

    protected applyEventVariables(content: string, member: GuildMember) {
        return new EventVariables(content)
            .user(member.user)
            .guild(member.guild)
            .memberCount(member.guild)
            .toString();
    }
}
