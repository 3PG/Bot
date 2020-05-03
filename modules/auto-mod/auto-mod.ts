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
import EventsService from '../../services/events.service';
import { emitter } from '../../bot';

export default class AutoMod {
    constructor(private members = Deps.get<Members>(Members)) {}

    readonly validators = new Map([
        [MessageFilter.Words, BadWordValidator],
        [MessageFilter.Links, BadLinkValidator],
        [MessageFilter.Emoji, EmojiValidator],
        [MessageFilter.MassMention, MassMentionValidator],
        [MessageFilter.MassCaps, MassCapsValidator],
        [MessageFilter.Zalgo, ZalgoValidator]
    ]);
    
    async validateMsg(msg: Message, guild: GuildDocument) {
        const activeFilters = guild.autoMod.filters;
        for (const filter of activeFilters) {
            try {
                const Validator = this.validators.get(filter);
                if (Validator)
                    new Validator().validate(msg.content, guild);
            } catch (validation) {
                if (guild.autoMod.autoDeleteMessages)
                    await msg.delete({ reason: validation });
                if (guild.autoMod.autoWarnUsers && msg.member && msg.client.user)
                    await this.warnMember(msg.member, msg.client.user, validation?.message);
            }
        }
    }

    async warnMember(member: GuildMember, instigator: User, reason = 'No reason specified.') {
        if (member.id === instigator.id)
            throw new TypeError('You cannot warn yourself.');
        if (member.user.bot)
            throw new TypeError('Bots cannot be warned.');

        const savedMember = await this.members.get(member);
        const warning = { reason, instigatorId: instigator.id, at: new Date() };

        savedMember.warnings.push(warning);        
        await this.members.save(savedMember);

        emitter.emit('userWarn', {
            guild: member.guild,
            instigator,
            user: member.user,
            reason,
            warnings: savedMember.warnings.length
        } as UserWarnArgs);

        try {
            await member.send(`<@!${instigator}> warned you for \`${reason}\``);
        } catch {}
    }
}

export interface UserWarnArgs {
    guild: Guild;
    user: User;
    instigator: User;
    warnings: number;
    reason: string;
}
