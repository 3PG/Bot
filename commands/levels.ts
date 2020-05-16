import { Command, CommandContext } from './command';
import Guilds from '../data/guilds';
import Deps from '../utils/deps';

export default class LevelsCommand implements Command {
    name = 'levels';
    summary = `List all your server's level roles`;
    cooldown = 3;
    module = 'XP';

    constructor(private guilds = Deps.get<Guilds>(Guilds)) {}

    execute = async(ctx: CommandContext) => {
        const savedGuild = await this.guilds.get(ctx.guild);

        let details = '';
        for (const levelRole of savedGuild.leveling.levelRoles)
            details += `**Level \`${levelRole.level}\`**: \`<@${levelRole.role}\`>\n`;
        
        return ctx.channel.send(details || 'No level roles set.');
    };
}
