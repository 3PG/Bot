import { Command, CommandContext } from './command';
import Deps from '../utils/deps';
import { GuildMember } from 'discord.js';
import Music from '../modules/music/music';
import Guilds from '../data/guilds';

export default class PlayCommand implements Command {
    name = 'play';
    summary = 'Join and play a youtube result.';
    cooldown = 1;
    module = 'Music';

    constructor(
        private guilds = Deps.get<Guilds>(Guilds),
        private music = Deps.get<Music>(Music)) {},
    
    execute = async(ctx: CommandContext, ...args: string[]) => {
        const query = args.join(' ');
        if (!query)
            throw new TypeError('Query must be provided.');

        const player = this.music.joinAndGetPlayer(ctx);

        const maxQueueSize = 5;
        if (player.queue.size >= maxQueueSize)
            throw new TypeError(`Max queue size of \`${maxQueueSize}\` reached.`);

        const savedGuild = await this.guilds.get(ctx.guild);
        const track = await this.music.findTrack(query, ctx.member, savedGuild);

        player.queue.add(track);
        if (player.playing)
            return ctx.channel.send(`**Added**: \`${track.title}\` to list.`);

        player.play();
    }
}
