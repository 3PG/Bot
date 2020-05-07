import EventHandler from './event-handler';
import Deps from '../../utils/deps';
import CommandService from '../command.service';
import Guilds from '../../data/guilds';
import AutoMod from '../../modules/auto-mod/auto-mod';
import Leveling from '../../modules/xp/leveling';
import { Message } from 'discord.js';
import Logs from '../../data/logs';

export default class MessageHandler implements EventHandler {
    on = 'message';

    constructor(
        private autoMod = Deps.get<AutoMod>(AutoMod),
        private commands = Deps.get<CommandService>(CommandService),
        private guilds = Deps.get<Guilds>(Guilds),
        private leveling = Deps.get<Leveling>(Leveling),
        private logs = Deps.get<Logs>(Logs)) {}

    async invoke(msg: Message) {        
        if (msg.author.bot) return;

        const guild = await this.guilds.get(msg.guild);
        const handled = await this.commands.handle(msg, guild);        
        if (handled) return;        

        let filter = undefined;
        let earnedXP = false;
        try {
            if (guild.autoMod.enabled)
                await this.autoMod.validateMsg(msg, guild);
            if (guild.xp.enabled) {
                await this.leveling.validateXPMsg(msg, guild);
                earnedXP = true;
            }
        } catch (validation) {
            filter = validation.filter;
        } finally {         
            await this.logs.logMessage(msg, { earnedXP, filter });
        }
    }
}