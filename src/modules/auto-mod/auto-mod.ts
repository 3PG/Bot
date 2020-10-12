import { Message, GuildMember, User, Guild } from 'discord.js';
import { GuildDocument, MessageFilter } from '../../data/models/guild';
import Deps from '../../utils/deps';
import Members from '../../data/members';
import { ContentValidator } from './validators/content-validator';
import { MemberDocument } from '../../data/models/member';
import fs from 'fs';
import { promisify } from 'util';
import Log from '../../utils/log';
import Emit from '../../services/emit';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

export let explicitWords: string[] = [];

export default class AutoMod {
    private validators: ContentValidator[] = [];

    constructor(
        private emit = Deps.get<Emit>(Emit),
        private members = Deps.get<Members>(Members)) {}

    async init() {
        const words = await readFile(`assets/explicit-words.txt`);
        const files = await readdir(`${__dirname}/validators`);
        
        explicitWords = words
            .toString()
            .replace(/\r/g, '')
            .split('\n');

        for (const fileName of files) {            
            const Validator = require(`${__dirname}/validators/${fileName}`).default;
            if (!Validator) continue;

            this.validators.push(new Validator());
        }
        Log.info(`Loaded: ${this.validators.length} validators`, `automod`);
    }
    
    async validate(msg: Message, guild: GuildDocument) {
        const activeFilters = guild.autoMod.filters;
        for (const filter of activeFilters)
            try {
                const validator = this.validators.find(v => v.filter === filter);
                await validator?.validate(msg.content, guild);
            } catch (validation) {
                if (guild.autoMod.autoDeleteMessages)
                    await msg.delete({ reason: validation.message });
                if (guild.autoMod.autoWarnUsers && msg.member)
                    await this.warn(msg.member, {
                        instigator: msg.client.user,
                        reason: validation.message
                    });
                throw validation;
            }
    }

    async warn(target: GuildMember, args: PunishmentArgs) {
        this.validateAction(target, args.instigator);

        const savedMember = await this.members.get(target);
        
        this.emit.warning(args, target, savedMember);
        await this.saveWarning(args, savedMember);
    }
    private async saveWarning(args: PunishmentArgs, savedMember: MemberDocument) {
        savedMember.warnings.push({
            at: new Date(),
            instigatorId: args.instigator.id,
            reason: args.reason
        });
        return this.members.save(savedMember);        
    }

    async mute(target: GuildMember, args: PunishmentArgs) {
        this.validateAction(target, args.instigator);

        const role = await this.getMutedRole(target.guild);
        target.roles.add(role);

        const savedMember = await this.members.get(target);

        this.emit.mute(args, target, savedMember);
        await this.saveMute(args, savedMember);
    }
    private async saveMute(args: PunishmentArgs, savedMember: MemberDocument) {
        savedMember.mutes.push({
            at: new Date(),
            reason: args.reason,
            instigatorId: args.instigator.id
        });
        return savedMember.save();
    }

    async unmute(target: GuildMember, args: PunishmentArgs) {
        this.validateAction(target, args.instigator);

        const role = await this.getMutedRole(target.guild);
        target.roles.remove(role);

        const savedMember = await this.members.get(target);

        this.emit.unmute(args, target, savedMember);
    }

    private validateAction(target: GuildMember, instigator: User) {
        if (target.id === instigator.id)
            throw new TypeError('You cannot punish yourself.');
        if (target.user.bot)
            throw new TypeError('Bots cannot be punished.');

        const instigatorMember = target.guild.members.cache
            .get(instigator.id);        
        if (instigatorMember.roles.highest.position <= target.roles.highest.position)
            throw new TypeError('User has the same or higher role.');
    }

    private async getMutedRole(guild: Guild) {
        return guild.roles.cache.find(r => r.name === 'Muted')
            ?? await guild.roles.create({ data: { name: 'Muted' } });
    }
}

export interface PunishmentArgs {
    instigator: User;
    reason: string;
}
export class ValidationError extends Error {
    constructor(message: string, public filter: MessageFilter) {
        super(message);
    }
}
