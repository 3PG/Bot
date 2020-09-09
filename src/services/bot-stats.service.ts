import config from '../../config.json';
import fetch from 'node-fetch';
import Log from '../utils/log';
import TopGG from 'dblapi.js';
import { setIntervalAsync } from 'set-interval-async/dynamic';
import Deps from '../utils/deps';
import { Client } from 'discord.js';

export default class BotStatsService {
    constructor(private bot = Deps.get<Client>(Client)) {}

    async init() {
        if (this.bot.user.id !== '525935335918665760') return;

        await this.sendTopGGStats();

        const updateInterval = 5 * 60 * 1000;
        setIntervalAsync(() => this.updateBotStats(), updateInterval);
    }

    async updateBotStats() {
        await this.sendDBLStats();
    }

    async sendTopGGStats() {
        const dbl = new TopGG(config.bot.botLists.topGG.token, this.bot);

        dbl.on('posted', () => Log.info('Sent stats to top.gg'));
        dbl.on('error', (error) => Log.error(error, 'botstats'));
    }

    async sendDBLStats() {
        const res: Response = await fetch(`https://discordbotlist.com/api/v1/bots/3pg/stats`, {
            method: 'POST',
            headers: {
                Authorization: `Bot ${config.bot.botLists.dbl.token}`,
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                shard_id: (this.bot.shard) ? this.bot.shard.count : 0,
                voice_connections: (this.bot.voice) ? this.bot.voice.connections.size : 0,
                guilds: this.bot.guilds.cache.size,
                users: this.bot.guilds.cache.reduce((prev, now) => prev + now.memberCount, 0)
            })
        });
        (res.status === 200)
            ? Log.info('Sent stats to discordbotlist.com', 'botstats')
            : Log.error('Failed to send stats to discordbotlist.com', 'botstats');
    }
}