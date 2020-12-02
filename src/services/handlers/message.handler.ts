import EventHandler from './event-handler';
import Deps from '../../utils/deps';
import CommandService from '../command.service';
import Guilds from '../../data/guilds';
import AutoMod from '../../modules/auto-mod/auto-mod';
import Leveling from '../../modules/xp/leveling';
import { Message, ClientEvents } from 'discord.js';
import Logs from '../../data/logs';

export default class MessageHandler implements EventHandler {
  on: keyof ClientEvents = 'message';

  constructor(
    private autoMod = Deps.get<AutoMod>(AutoMod),
    private commands = Deps.get<CommandService>(CommandService),
    private guilds = Deps.get<Guilds>(Guilds),
    private leveling = Deps.get<Leveling>(Leveling),
    private logs = Deps.get<Logs>(Logs)) {}

  async invoke(msg: Message) {
    if (msg.author.bot) return;

    const savedGuild = await this.guilds.get(msg.guild);

    const isCommand = msg.content.startsWith(savedGuild.general.prefix);
    if (isCommand) {
      const command = await this.commands.handle(msg, savedGuild);
      return command;// && this.logs.logCommand(msg, command);
    }     

    let filter = undefined;
    let earnedXP = false;
    try {
      if (savedGuild.autoMod.enabled)
        await this.autoMod.validate(msg, savedGuild);
      if (savedGuild.leveling.enabled) {
        await this.leveling.validateXPMsg(msg, savedGuild);
        earnedXP = true;
      }
    } catch (validation) {
      filter = validation.filter;
    } finally {     
      // await this.logs.logMessage(msg, { earnedXP, filter });
    }
  }
}