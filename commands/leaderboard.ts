import { Command, CommandContext } from './Command';
import config from '../config.json';

export default class LeaderboardCommand implements Command {
    name = 'leaderboard';
    summary = `Get a link to the server's leaderboard`;
    cooldown = 3;
    module = 'XP';
    
    execute = async(ctx: CommandContext) => {
        ctx.channel.send(`${config.webapp.url}/leaderboard/${ctx.guild.id}`);
    }
}
