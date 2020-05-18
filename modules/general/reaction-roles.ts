import { GuildDocument } from "../../data/models/guild";
import { MessageReaction } from "discord.js";

export default class ReactionRoles {
    async checkToAdd(msgReaction: MessageReaction, savedGuild: GuildDocument) {
        const config = this.getReactionRole(msgReaction, savedGuild);
        if (!config) return;

        const { member, guild } = msgReaction.message;
        const role = guild.roles.cache.get(config.role);
        if (role)
            await member.roles.add(role);
    }

    async checkToRemove(msgReaction: MessageReaction, savedGuild: GuildDocument) {
        const config = this.getReactionRole(msgReaction, savedGuild);
        if (!config) return;

        const { member, guild } = msgReaction.message;
        const role = guild.roles.cache.get(config.role);
        if (role)
            await member.roles.remove(role);
    }

    private getReactionRole(msgReaction: MessageReaction, savedGuild: GuildDocument) {
        const msg = msgReaction.message;
        return savedGuild.general.reactionRoles
            .find(r => r.channel === msg.channel.id
                && r.messageId === msg.id
                && r.emote === msgReaction.emoji.name);
    }
}