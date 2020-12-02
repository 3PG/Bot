import { Command, CommandContext, Permission } from './command';
import AutoMod from '../modules/auto-mod/auto-mod';
import Deps from '../utils/deps';
import { getMemberFromMention } from '../utils/command-utils';
import Guilds from '../data/guilds';

export default class UnmuteCommand implements Command {
  precondition: Permission = 'MUTE_MEMBERS';
  name = 'unmute';
  usage = 'unmute target_id/mention';
  summary = 'Allow a user to send messages.';
  cooldown = 3;
  module = 'Auto-mod';
  
  constructor(
    private autoMod = Deps.get<AutoMod>(AutoMod)) {}
  
  execute = async(ctx: CommandContext, targetMention: string, ...args: string[]) => {
    const target = getMemberFromMention(targetMention, ctx.guild);
    
    const reason = args?.join(' ') || 'Unspecified';
    await this.autoMod.unmute(target, { instigator: ctx.user, reason });

    await ctx.channel.send(`<@!${target.id}> was unmuted for \`${reason}\``);
  };
}
