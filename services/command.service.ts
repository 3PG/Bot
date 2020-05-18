import fs from 'fs';
import { Message,  TextChannel, GuildMember, User } from 'discord.js';
import { Command, CommandContext } from '../commands/command';
import Log from '../utils/log';
import Deps from '../utils/deps';
import Commands from '../data/commands';
import Logs from '../data/logs';
import { GuildDocument } from '../data/models/guild';
import Cooldowns from './cooldowns';
import Validators from './validators';

export default class CommandService {
    private commands = new Map<string, Command>();

    constructor(
        private logs = Deps.get<Logs>(Logs),
        private cooldowns = Deps.get<Cooldowns>(Cooldowns),
        private validators = Deps.get<Validators>(Validators),
        commands = Deps.get<Commands>(Commands)) {
        this.loadCommandFiles(commands); 
    }

    private loadCommandFiles(commands: Commands) {
        fs.readdir('./commands/', async(err, files) => {
            err && Log.error(err, 'cmds');
            for (const file of files) {
                const Command = require(`../commands/${file}`).default;
                if (!Command) continue;
                
                const command = new Command();
                this.commands.set(command.name, command);
                await commands.get(command);
            }
            Log.info(`Loaded: ${this.commands.size} commands`, `cmds`);
        });
    }

    async handle(msg: Message, guild: GuildDocument) {
        if (!(msg.member && msg.content && msg.guild && !msg.author.bot)) return;

        return (msg.content.startsWith(guild.general.prefix)) ?
            this.handleCommand(msg, guild) : false;
    }
    private async handleCommand(msg: Message, savedGuild: GuildDocument) {
        const content = msg.content.toLowerCase();
        try {
            this.validators.checkChannel(msg.channel as TextChannel, savedGuild);

            const command = this.findCommand(savedGuild.general.prefix, content);
            if (!command || this.cooldowns.active(msg.author, command)) return;

            this.validators.checkCommand(command, savedGuild, msg);
            this.validators.checkPreconditions(command, msg.member);

            await this.findAndExecute(msg, savedGuild);

            this.cooldowns.add(msg.author, command);

            await this.logs.logCommand(msg, command);
        } catch (error) {
            const content = error?.message ?? 'Un unknown error occurred';          
            msg.channel.send(':warning: ' + content);
        } finally { return true; }
    }

    async findAndExecute(msg: Message, savedGuild: GuildDocument) {
        const prefix = savedGuild.general.prefix;
        const command = this.findCommand(prefix, msg.content);
        
        await command.execute(new CommandContext(msg), 
            ...this.getCommandArgs(prefix, prefix + msg.content));  
    }

    private findCommand(prefix: string, content: string) {        
        const name = content.split(' ')[0].substring(prefix.length, content.length);
        return this.commands.get(name);
    }
    private getCommandArgs(prefix: string, content: string) {
        let args = content.split(' ');
        return args.splice(prefix.length, args.length);
    }
}
