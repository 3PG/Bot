import { Timer, GuildDocument, MessageTimer, CommandTimer } from '../../data/models/guild';
import Deps from '../../utils/deps';
import Guilds from '../../data/guilds';
import { TextChannel, Client } from 'discord.js';
import CommandService from '../../services/command.service';
import Log from '../../utils/log';
import { scheduleJob, Job } from 'node-schedule';
import { generateUUID } from '../../utils/command-utils';
import { setIntervalAsync, clearIntervalAsync, SetIntervalAsyncTimer } from 'set-interval-async/dynamic';

export default class Timers {
  private readonly currentTimers = new Map<string, TimerTask[]>();
  
  private startedTimers = 0;

  constructor(
    private bot = Deps.get<Client>(Client),
    private commandService = Deps.get<CommandService>(CommandService),
    private guilds = Deps.get<Guilds>(Guilds)) {}

  async init() {
    for (const id of this.bot.guilds.cache.keys())
      await this.startTimers(id);
    Log.info(`Started ${this.startedTimers} timers`, 'timers');    
  }

  async endTimers(guildId: string) {
    const guildTimers = this.get(guildId);    
    for (const task of guildTimers) {
      task.job?.cancel();
      delete task.job;

      await clearIntervalAsync(task.interval);
      delete task.interval;
    }
    this.currentTimers.delete(guildId);
  }

  async startTimers(guildId: string) {
    const guild = this.bot.guilds.cache.get(guildId);
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
      uuid = generateUUID();
    
    if (from.toString() === 'Invalid Date')
      return status = 'FAILED';

    this.get(savedGuild.id)
      .push({ status, timer, uuid, job, interval: null });    

    if (from >= new Date())
      job = scheduleJob(from, () => this.schedule(uuid, savedGuild, interval));
    else
      await this.schedule(uuid, savedGuild, interval);

    this.startedTimers++;
  }
  get(guildId: string) {
    return this.currentTimers.get(guildId)
      ?? this.currentTimers.set(guildId, []).get(guildId);
  }

  private async schedule(uuid: string, savedGuild: GuildDocument, interval: number) {
    const task = this.findTask(uuid, savedGuild.id);
    if (!task.timer) return;

    task.status = 'ACTIVE';

    await this.sendTimer(task, savedGuild);
    task.interval = setIntervalAsync(
      () => this.sendTimer(task, savedGuild), interval);
    
  }
  private findTask(uuid: string, guildId: string) {
    return this.get(guildId)?.find(t => t.uuid === uuid);    
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
      console.log(error.message);      
      task.status = 'FAILED';
    }
  }

  private async sendCommandTimer(savedGuild: GuildDocument, timer: CommandTimer) {
    const guild = this.bot.guilds.cache.get(savedGuild.id);
    const member = guild.members.cache.get(this.bot.user.id);
    const channel = guild.channels.cache.get(timer.channel);

    await this.commandService.handleCommand({
      author: this.bot.user,
      channel,
      client: this.bot,
      content: `${savedGuild.general.prefix}${timer.command ?? ''}`,
      guild: member.guild,
      member
    } as any, savedGuild);
  }
  private async sendMessageTimer(timer: any) {
    const channel = this.bot.channels.cache.get(timer.channel) as TextChannel;
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