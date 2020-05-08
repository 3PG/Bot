import { Timer, CommandTimer, MessageTimer, GuildDocument } from '../../models/guild';
import Deps from '../../utils/deps';
import Guilds from '../../data/guilds';
import { bot } from '../../bot';
import { TextChannel } from 'discord.js';
import CommandService from '../../services/command.service';
import Log from '../../utils/log';
import { scheduleJob } from 'node-schedule';

export default class Timers {
    readonly currentTimers = new Map<string, TimerTask[]>();
    
    private startedTimers = 0;

    constructor(
        private commandService = Deps.get<CommandService>(CommandService),
        private guilds = Deps.get<Guilds>(Guilds)) {}

    async initialize() {        
        for (const id of bot.guilds.cache.keys())
            await this.startTimers(id);
        Log.info(`Started ${this.startedTimers} timers`, 'timers');        
    }

    cancelTimers(guildId: string) {
        const guildTimers = this.currentTimers.get(guildId) ?? [];
        for (const timer of guildTimers)
            timer.id.unref();
        this.currentTimers.set(guildId, []);
    }

    async startTimers(guildId: string) {
        const guild = bot.guilds.cache.get(guildId);
        const savedGuild = await this.guilds.get(guild);

        for (const timer of savedGuild.timers.commandTimers)
            this.startTimer(guildId, timer, savedGuild);
            
        for (const timer of savedGuild.timers.messageTimers)
            this.startTimer(guildId, timer, savedGuild);

    }

    startTimer(guildId: string, timer: Timer, savedGuild: GuildDocument) {
        const minInterval = 60 * 1000;
        const interval = this.getInterval(timer.interval);
        if (interval < minInterval || !timer.enabled) return;

        scheduleJob(timer.from, () => {
            const guildTimers = this.currentTimers.get(guildId) 
                ?? this.currentTimers.set(guildId, []).get(guildId);
    
            let task: TimerTask;
            const id = setInterval(async() => await this.sendTimer(task, savedGuild), interval);
    
            task = {
                id,
                status: { name: 'ACTIVE' },
                timer
            };
            guildTimers.push(task);
            
            this.startedTimers++;
        });
    }

    getInterval(interval: string) {
        const hours = Number(interval.split(':')[0]);
        const minutes = Number(interval.split(':')[1]);

        return ((hours * 60) + minutes) * 60 * 1000;
    }

    private async sendTimer(task: TimerTask, savedGuild: GuildDocument) {
        const timer = task.timer as any;
        if ('command' in timer) {
            try {
                const guild = bot.guilds.cache.get(savedGuild.id);
                const member = guild.members.cache.get(bot.user.id);
                const channel = guild.channels.cache.get(timer.channel);
    
                await this.commandService.findAndExecute({
                    channel,
                    client: bot,
                    content: timer.message,
                    guild: member.guild
                } as any, savedGuild);
            } catch (error) {
                task.status.name = 'FAILED';
                task.status.reason = error?.message;
            }
        }
        if ('message' in timer) {
            try {
                const channel = bot.channels.cache.get(timer.channel) as TextChannel;
                channel.send(timer.message);
            } catch (error) {
                task.status.name = 'FAILED';
                task.status.reason = error?.message;
            }
        }
    }
}

export interface TimerTask {
    id: NodeJS.Timeout;
    status: {
        name: 'PENDING' | 'ACTIVE' | 'FAILED';
        reason?: string;
    }
    timer: Timer;
}