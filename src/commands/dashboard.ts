import { Command, CommandContext, Permission } from './command';
import config from '../../config.json';

export default class DashboardCommand implements Command {
    precondition: Permission = 'MANAGE_GUILD';
    name = 'dashboard';
    summary = `Get a link to the server's dashboard`;
    cooldown = 3;
    module = 'General';
    
    execute = async(ctx: CommandContext) => {
        return ctx.channel.send(`${config.dashboardURL}/servers/${ctx.guild.id}`);
    }
}
