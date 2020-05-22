import { Command, CommandContext, Permission } from './command';
import AutoMod from '../modules/auto-mod/auto-mod';
import Deps from '../utils/deps';
import { getMemberFromMention } from '../utils/command-utils';
import Guilds from '../data/guilds';

export default class UnmuteCommand implements Command {
    precondition: Permission = 'MUTE_MEMBERS';
    name = 'unmute';
    summary = 'Allow a user to send messages.';
    cooldown = 3;
    module = 'Auto-mod';
    
    constructor(
        private autoMod = Deps.get<AutoMod>(AutoMod),
        private guilds = Deps.get<Guilds>(Guilds)) {}
    
    execute = async(ctx: CommandContext, targetMention: string, ...args: string[]) => {
        const target = getMemberFromMention(targetMention, ctx.guild);
        
        await this.autoMod.unmute(target, ctx.user);

        const reason = args.join(' ') || 'Unspecified';
        await ctx.channel.send(`<@!${target.id}> was unmuted for \`${reason}\``);
    };
}
