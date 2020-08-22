import { ShardingManager } from 'discord.js';
import config from '../../config.json';

const manager = new ShardingManager('./bot.ts', {
  totalShards: 'auto',
  token: config.bot.token
});

manager.spawn();

manager.on('shardCreate', (shard) => console.log(`Shard ${shard.id} launched`));