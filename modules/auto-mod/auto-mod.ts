import { Message, GuildMember, User, Guild } from 'discord.js';
import { GuildDocument, MessageFilter } from '../../models/guild';
import { BadWordValidator } from './validators/bad-word.validator';
import { BadLinkValidator } from './validators/bad-link.validator';
import Deps from '../../utils/deps';
import Members from '../../data/members';
import { EmojiValidator } from './validators/emoji.validator';
import { MassMentionValidator } from './validators/mass-mention.validator';
import { MassCapsValidator } from './validators/mass-caps.validator';
import { ZalgoValidator } from './validators/zalgo.validator';
import { emitter } from '../../bot';
import { ContentValidator } from './validators/content-validator';

export default class AutoMod {
    constructor(private members = Deps.get<Members>(Members)) {}

    readonly validators: ContentValidator[] = [
        new BadWordValidator(),
        new BadLinkValidator(),
        new EmojiValidator(),
        new MassMentionValidator(),
        new MassCapsValidator(),
        new ZalgoValidator()
    ];
    
    async validateMsg(msg: Message, guild: GuildDocument) {
        const activeFilters = guild.autoMod.filters;
        for (const filter of activeFilters) {
            try {                
                const validator = this.validators.find(v => v.filter === filter);
                validator?.validate(msg.content, guild);
            } catch (validation) {
                if (guild.autoMod.autoDeleteMessages)
                    await msg.delete({ reason: validation.message });
                if (guild.autoMod.autoWarnUsers && msg.member && msg.client.user)
                    await this.warn(msg.member, msg.client.user, validation.message);

                throw validation;
            }
        }
    }

    async warn(target: GuildMember, instigator: User, reason = 'No reason specified.') {
        if (target.id === instigator.id)
            throw new TypeError('You cannot warn yourself.');
        if (target.user.bot)
            throw new TypeError('Bots cannot be warned.');

        const savedMember = await this.members.get(target);
        const warning = { reason, instigatorId: instigator.id, at: new Date() };

        savedMember.warnings.push(warning);        
        await this.members.save(savedMember);

        emitter.emit('userWarn', {
            guild: target.guild,
            instigator,
            user: target.user,
            reason,
            warnings: savedMember.warnings.length
        } as UserPunishmentArgs);
    }

    async mute(target: GuildMember, instigator: User) {
        if (target.id === instigator.id)
            throw new TypeError('You cannot mute yourself.');
        if (target.user.bot)
            throw new TypeError('Bots cannot be muted.');

        const role = await this.getMutedRole(target.guild);
        target.roles.add(role);            
    }

    async unmute(target: GuildMember, instigator: User) {   
        if (target.id === instigator.id)
            throw new TypeError('You cannot unmute yourself.');
        if (target.user.bot)
            throw new TypeError('Bots cannot be unmuted.');

        const role = await this.getMutedRole(target.guild);
        target.roles.remove(role);
    }

    private async getMutedRole(guild: Guild) {
        let role = guild.roles.cache.find(r => r.name === 'Muted');
        if (!role)
            role = await guild.roles.create({ data: { name: 'Muted' } });
        return role;
    }
}

export interface UserPunishmentArgs {
    guild: Guild;
    user: User;
    instigator: User;
    warnings: number;
    reason: string;
}

export class ValidationError extends Error {
    constructor(message: string, public filter: MessageFilter) {
        super(message);
    }
}
