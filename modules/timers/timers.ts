import { Timer, CommandTimer, MessageTimer, GuildDocument } from '../../data/models/guild';
import Deps from '../../utils/deps';
import Guilds from '../../data/guilds';
import { bot } from '../../bot';
import { TextChannel } from 'discord.js';
import CommandService from '../../services/command.service';
import Log from '../../utils/log';
import { scheduleJob, Job } from 'node-schedule';
import { createUUID } from '../../utils/command-utils';

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
        for (const timer of guildTimers) {
            timer.interval?.unref();
            timer.job?.cancel(false);
        }
        this.currentTimers.set(guildId, []);
    }

    async startTimers(guildId: string) {
        const guild = bot.guilds.cache.get(guildId);
        const savedGuild = await this.guilds.get(guild);

        for (const timer of savedGuild.timers.commandTimers)
            await this.startTimer(timer, savedGuild);            
        for (const timer of savedGuild.timers.messageTimers)
            await this.startTimer(timer, savedGuild);
    }

    startTimer(timer: Timer, savedGuild: GuildDocument) {
        const minInterval = 60 * 1000;
        const interval = this.getInterval(timer.interval);        
        if (interval < minInterval || !timer.enabled) return;

        let from = new Date(timer.from),
            job: Job,
            status: any = 'PENDING',
            uuid = createUUID();
        
        if (from.toString() === 'Invalid Date')
            status = 'FAILED';

        this.getGuildTimers(savedGuild.id)
            .push({ status, timer, uuid, job });
            
        this.startedTimers++;

        if (from < new Date())
            return this.schedule(uuid, savedGuild, interval);

        job = scheduleJob(from,
            () => this.schedule(uuid, savedGuild, interval));
    }
    private getGuildTimers(id: string) {
        return this.currentTimers.get(id)
            ?? this.currentTimers.set(id, []).get(id);
    }

    private async schedule(uuid: string, savedGuild: GuildDocument, interval: number) {
        const task = this.findTask(uuid, savedGuild.id);
        if (!task) return;

        task.status = 'ACTIVE';
        task.interval = setInterval(
            async() => await this.sendTimer(task, savedGuild), interval);
    }
    private findTask(uuid: string, guildId: string) {
        return this.getGuildTimers(guildId)?.find(t => t.uuid === uuid);        
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
                    content: savedGuild.general.prefix + timer.command ?? '',
                    guild: member.guild,
                    member
                } as any, savedGuild);
            } catch (error) { task.status = 'FAILED'; }
        }
        if ('message' in timer) {
            try {
                const channel = bot.channels.cache.get(timer.channel) as TextChannel;
                channel.send(timer.message);
            } catch { task.status = 'FAILED'; }
        }
    }
}

export interface TimerTask {
    uuid: string;
    interval?: NodeJS.Timeout;
    job?: Job;
    status: 'PENDING' | 'ACTIVE' | 'FAILED';
    timer: Timer;
}