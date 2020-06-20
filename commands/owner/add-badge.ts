import { Command, CommandContext, Permission } from '../command';
import { getMemberFromMention } from '../../utils/command-utils';
import Deps from '../../utils/deps';
import Users from '../../data/users';
import { BadgeType } from '../../data/models/user';

export default class ClearCommand implements Command {
    precondition: Permission = '';
    name = 'add-badge';
    summary = 'An owner command.';
    cooldown = 3;
    module = 'Owner';

    constructor(private users = Deps.get<Users>(Users)) {}
    
    execute = async(ctx: CommandContext, targetMention: string, name: string, tier = 0) => {
        const target = (targetMention) ?
            getMemberFromMention(targetMention, ctx.guild) : ctx.member;
            
        const type = BadgeType[name];        
        if (!type)
            throw new TypeError('Badge not found.');

        const savedUser = await this.users.get(target.user);
        const badge = savedUser.badges.find(b => b.type === type);        
        if (!badge) {
            savedUser.badges.push({ at: new Date(), tier, type });
            await ctx.msg.channel.send(`User now has the \`${name}\` badge.`);
        }
        else {        
            badge.tier = tier;
            badge.at = new Date();
            await ctx.msg.channel.send(`User's ${name} badge is now \`Tier ${tier}\`.`);
        }
        savedUser.save();        
    }
}
