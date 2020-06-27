import { Timer, GuildDocument } from '../../data/models/guild';
import Deps from '../../utils/deps';
import Guilds from '../../data/guilds';
import { bot } from '../../bot';
import { TextChannel } from 'discord.js';
import CommandService from '../../services/command.service';
import Log from '../../utils/log';
import { scheduleJob, Job } from 'node-schedule';
import { createUUID } from '../../utils/command-utils';
import { setIntervalAsync, clearIntervalAsync, SetIntervalAsyncTimer } from 'set-interval-async/dynamic';

export default class Timers {
    private readonly currentTimers = new Map<string, TimerTask[]>();
    
    private startedTimers = 0;

    constructor(
        private commandService = Deps.get<CommandService>(CommandService),
        private guilds = Deps.get<Guilds>(Guilds)) {}

    async init() {
        for (const id of bot.guilds.cache.keys())
            await this.startTimers(id);
        Log.info(`Started ${this.startedTimers} timers`, 'timers');        
    }

    async endTimers(guildId: string) {
        const guildTimers = this.getGuildTimers(guildId);        
        for (const task of guildTimers) {
            task.job?.cancel();            
            await clearIntervalAsync(task.interval);
        }
        this.currentTimers.delete(guildId);
    }

    async startTimers(guildId: string) {
        const guild = bot.guilds.cache.get(guildId);
        const savedGuild = await this.guilds.get(guild);

        for (const timer of savedGuild.timers.commandTimers)
            await this.startTimer(timer, savedGuild);            
        for (const timer of savedGuild.timers.messageTimers)
            await this.startTimer(timer, savedGuild);
    }

    async startTimer(timer: Timer, savedGuild: GuildDocument) {
        const interval = this.getInterval(timer.interval);        
        const minInterval = 60 * 1000;
        if (interval < minInterval || !timer.enabled) return;

        let from = new Date(timer.from),
            job: Job,
            status: TimerStatus = 'PENDING',
            uuid = createUUID();
        
        if (from.toString() === 'Invalid Date')
            return status = 'FAILED';

        this.getGuildTimers(savedGuild.id)
            .push({ status, timer, uuid, job, interval: null });        

        if (from >= new Date())
            job = scheduleJob(from, () => this.schedule(uuid, savedGuild, interval));
        else
            this.schedule(uuid, savedGuild, interval);

        this.startedTimers++;
    }
    getGuildTimers(id: string) {
        return this.currentTimers.get(id)
            ?? this.currentTimers.set(id, []).get(id);
    }

    private schedule(uuid: string, savedGuild: GuildDocument, interval: number) {
        const task = this.findTask(uuid, savedGuild.id);
        if (!task.timer) return;

        task.status = 'ACTIVE';
        task.interval = setIntervalAsync(
            () => this.sendTimer(task, savedGuild), interval);
        
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
        const member = guild.members.cache.get(bot.user.id);
        const channel = guild.channels.cache.get(timer.channel);

        await this.commandService.findAndExecute(savedGuild.general.prefix, {
            channel,
            client: bot,
            content: timer.command ?? '',
            guild: member.guild,
            member
        } as any);
    }
    private async sendMessageTimer(timer: any) {
        const channel = bot.channels.cache.get(timer.channel) as TextChannel;
        await channel.send(timer.message);
    }
}

export interface TimerTask {
    uuid: string;
    interval: SetIntervalAsyncTimer;
    job?: Job;
    status: TimerStatus;
    timer: Timer;
}

export type TimerStatus = 'PENDING' | 'ACTIVE' | 'FAILED';