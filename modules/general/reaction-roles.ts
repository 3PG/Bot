import { GuildDocument } from "../../data/models/guild";
import { MessageReaction } from "discord.js";

export default class ReactionRoles {
    async checkToAdd(reaction: MessageReaction, savedGuild: GuildDocument) {        
        const config = this.getReactionRole(reaction, savedGuild);
        if (!config) return;

        const { member, guild } = reaction.message;
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

    private getReactionRole(reaction: MessageReaction, savedGuild: GuildDocument) {
        const msg = reaction.message;
        const toHex = (a: string) => a.codePointAt(0).toString(16);

        return savedGuild.general.reactionRoles
            .find(r => r.channel === msg.channel.id
                && r.messageId === msg.id
                && toHex(r.emote) === toHex(reaction.emoji.name));
    }
}