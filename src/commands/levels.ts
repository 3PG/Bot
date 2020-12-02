import { Command, CommandContext, Permission } from './command';
import Guilds from '../data/guilds';
import Deps from '../utils/deps';

export default class LevelsCommand implements Command {
  precondition: Permission = '';
  name = 'levels';
  summary = `List all your server's level roles`;
  cooldown = 3;
  module = 'Leveling';

  constructor(private guilds = Deps.get<Guilds>(Guilds)) {}

  execute = async(ctx: CommandContext) => {
    const savedGuild = await this.guilds.get(ctx.guild);

    let details = '';
    for (const levelRole of savedGuild.leveling.levelRoles)
      details += `**Level \`${levelRole.level}\`**: <@&${levelRole.role}>\n`;
    
    return ctx.channel.send(details || 'No level roles set.');
  };
}
