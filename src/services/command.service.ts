import fs from 'fs';
import { Message,  TextChannel } from 'discord.js';
import { Command, CommandContext } from '../commands/command';
import Log from '../utils/log';
import Deps from '../utils/deps';
import Commands from '../data/commands';
import { GuildDocument } from '../data/models/guild';
import Cooldowns from './cooldowns';
import Validators from './validators';
import { promisify } from 'util';
import config from '../../config.json';

const readdir = promisify(fs.readdir);

export default class CommandService {
    private commands = new Map<string, Command>();
    private ownerCommands = new Map<string, Command>();

    constructor(
        private cooldowns = Deps.get<Cooldowns>(Cooldowns),
        private validators = Deps.get<Validators>(Validators),
        private savedCommands = Deps.get<Commands>(Commands)) {}

    async init() {
        await this.loadCommands();
    }

    private async loadCommands() {        
        let files = await readdir(`./src/commands`);

        // await this.savedCommands.deleteAll();
        
        for (const fileName of files) {
            const cleanName = fileName.replace(/(\..*)/, '');
            
            const Command = await require(`../commands/${cleanName}`).default;
            if (!Command) continue;
            
            const command = new Command();
            this.commands.set(command.name, command);
            
            // await this.savedCommands.get(command);
        }
        Log.info(`Loaded: ${this.commands.size} commands`, `cmds`);
    }

    async handle(msg: Message, savedGuild: GuildDocument) {
        return (msg.member && msg.content && msg.guild && !msg.author.bot)
            ? this.handleCommand(msg, savedGuild) : null;
    }
    private async handleCommand(msg: Message, savedGuild: GuildDocument) {
        try {
            this.validators.checkChannel(msg.channel as TextChannel, savedGuild);

            const prefix = savedGuild.general.prefix;
            const slicedContent = msg.content.slice(prefix.length);

            const command = this.findCommand(slicedContent);
            if (!command || this.cooldowns.active(msg.author, command))
                return null;
            if (msg.author.id !== config.bot.ownerId
                && this.ownerCommands.has(command.name))
                throw new TypeError('You found an owner command! 🎉');

            this.validators.checkCommand(command, savedGuild, msg);
            this.validators.checkPreconditions(command, msg.member);

            await this.findAndExecute(prefix, msg);

            this.cooldowns.add(msg.author, command);

            return command;
        } catch (error) {
            const content = error?.message ?? 'Un unknown error occurred';          
            msg.channel.send(':warning: ' + content);
        }
    }

    async findAndExecute(prefix: string, msg: Message) {
        const slicedContent = msg.content.slice(prefix.length);
        const command = this.findCommand(slicedContent);        
        
        return command.execute(new CommandContext(msg), 
            ...slicedContent
                .split(' ')
                .slice(prefix.length));  
    }

    private findCommand(slicedContent: string) {        
        const name = slicedContent
            .toLowerCase()
            .split(' ')[0];

        return this.commands.get(name) ?? this.findByAlias(name);
    }
    private findByAlias(name: string) {
        return Array.from(this.commands.values())
            .find(c => c.aliases?.some(a => a === name));
    }

    private getCommandArgs(prefix: string, content: string) {
        return content
            .split(' ')
            .slice(prefix.length); // .ping arg1 arg2 -> ping arg1 arg2
    }
}
