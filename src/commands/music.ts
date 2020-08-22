import { Command, CommandContext, Permission } from './command';
import config from '../../config.json';

export default class MusicCommand implements Command {
    precondition: Permission = 'MANAGE_GUILD';
    name = 'music';
    summary = `Get a link to the server's music manager`;
    cooldown = 3;
    module = 'Music';
    
    execute = async(ctx: CommandContext) => {
        return ctx.channel.send(`${config.dashboardURL}/servers/${ctx.guild.id}/music`);
    }
}
