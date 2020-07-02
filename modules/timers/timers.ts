import { Timer, GuildDocument } from '../../data/models/guild';
import Deps from '../../utils/deps';
import Guilds from '../../data/guilds';
import { bot } from '../../bot';
import { TextChannel, Guild } from 'discord.js';
import CommandService from '../../services/command.service';
import Log from '../../utils/log';
import { scheduleJob, Job } from 'node-schedule';
import { createUUID } from '../../utils/command-utils';
import { setIntervalAsync, clearIntervalAsync, SetIntervalAsyncTimer } from 'set-interval-async/dynamic';

export default class Timers {
    private started = false;
    private readonly currentTimers = new Map<string, TimerTask[]>();
    
    private startedTimers = 0;

    constructor(
        private commandService = Deps.get<CommandService>(CommandService),
        private guilds = Deps.get<Guilds>(Guilds)) {}

    async init() {
        if (this.started) return;
        this.started = true;

        for (const id of bot.guilds.cache.keys())
            await this.startTimers(id);
        Log.info(`Started ${this.startedTimers} timers`, 'timers');        
    }

    // dangerous 4
    async endTimers(guildId: string) {
        const guildTimers = this.getGuildTimers(guildId);        
        for (const task of guildTimers) {
            task.job?.cancel();
            await clearIntervalAsync(task.timeout);
        }
        this.currentTimers.delete(guildId);
    }

    // dangerous 3
    async startTimers(guildId: string) {
        const guild = bot.guilds.cache.get(guildId);
        const savedGuild = await this.guilds.get(guild);

        for (const timer of savedGuild.timers.commandTimers)
            await this.startTimer(timer, savedGuild);            
        for (const timer of savedGuild.timers.messageTimers)
            await this.startTimer(timer, savedGuild);
    }

    // dangerous 1
    async startTimer(timer: Timer, savedGuild: GuildDocument) {
        const interval = this.getInterval(timer.interval);
        const minInterval = 60 * 1000;
        if (interval < minInterval || !timer.enabled) return;

        this.schedule(timer, savedGuild);

        this.startedTimers++;
    }
    
    private schedule(timer: Timer, savedGuild: GuildDocument) {
        const interval = this.getInterval(timer.interval);

        const from = new Date(timer.from);

        this.getGuildTimers(savedGuild.id)
            .push({
                job: (from >= new Date())
                    ? scheduleJob(from, () => this.startInterval(savedGuild, interval))
                    : null,
                status: (from.toString() === 'Invalid Date') ? 'FAILED' : 'PENDING',
                timeout: (from < new Date())
                    ? this.startInterval(savedGuild, interval)
                    : null,
                timer
            });
    }

    // safe
    getGuildTimers(id: string) {
        return this.currentTimers.get(id)
            ?? this.currentTimers.set(id, []).get(id);
    }

    // dangerous 2
    private startInterval(savedGuild: GuildDocument, intervalMs: number) {
        let task: TimerTask;

        const status = 'ACTIVE';
        const timeout = setIntervalAsync(() =>
            this.sendTimer(task, savedGuild), intervalMs);
        
        task = this.findTask(timeout.id, savedGuild.id);
        if (!task) return;

        task.status = status;
        task.timeout = timeout;

        return timeout;
    }

    // safe: \/
    private findTask(id: number, guildId: string) {
        return this
            .getGuildTimers(guildId)
            ?.find(t => t.timeout.id === id);
    }

    getInterval(interval: string) {
        const hours = Number(interval.split(':')[0]);
        const minutes = Number(interval.split(':')[1]);

        return ((hours * 60) + minutes) * 60 * 1000;
    }

    private async sendTimer(task: TimerTask, savedGuild: GuildDocument) {
        try {
            const timer = task.timer as any;
            if ('command' in timer)
                await this.sendCommandTimer(savedGuild, timer);
            if ('message' in timer)
                this.sendMessageTimer(timer);
        } catch (error) {
            task.status = 'FAILED';
        }
    }

    private async sendCommandTimer(savedGuild: GuildDocument, timer: any) {
        const guild = bot.guilds.cache.get(savedGuild.id);

        await this.commandService.findAndExecute(savedGuild.general.prefix, {
            channel: guild.channels.cache.get(timer.channel),
            client: bot,
            content: timer.command ?? '',
            guild,
            member: guild.members.cache.get(bot.user.id)
        } as any);
    }
    private async sendMessageTimer(timer: any) {
        const channel = bot.channels.cache.get(timer.channel) as TextChannel;
        await channel.send(timer.message);
    }
}

export interface TimerTask {
    timeout?: SetIntervalAsyncTimer;
    job?: Job;
    status: TimerStatus;
    timer: Timer;
}

export type TimerStatus = 'PENDING' | 'ACTIVE' | 'FAILED';