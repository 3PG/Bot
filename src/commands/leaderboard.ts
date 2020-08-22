import { Command, CommandContext, Permission } from './command';
import config from '../../config.json';

export default class LeaderboardCommand implements Command {
    precondition: Permission = '';
    name = 'leaderboard';
    summary = `Get a link to the server's leaderboard`;
    cooldown = 3;
    module = 'Leveling';
    
    execute = async(ctx: CommandContext) => {
        ctx.channel.send(`${config.dashboardURL}/leaderboard/${ctx.guild.id}`);
    }
}
