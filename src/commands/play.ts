import { Command, CommandContext, Permission } from './command';
import Deps from '../utils/deps';
import Music from '../modules/music/music';
import Guilds from '../data/guilds';

export default class PlayCommand implements Command {
    aliases = ['p'];
    cooldown = 1;
    module = 'Music';
    name = 'play';
    precondition: Permission = 'SPEAK';
    summary = 'Join and play a youtube result.';
    usage = 'play a youtube video';

    constructor(
        private guilds = Deps.get<Guilds>(Guilds),
        private music = Deps.get<Music>(Music)) {}
    
    execute = async(ctx: CommandContext, ...args: string[]) => {
        const query = args?.join(' ');
        if (!query)
            throw new TypeError('Query must be provided.');

        const player = this.music.joinAndGetPlayer(ctx.member, ctx.channel);

        const maxQueueSize = 5;
        if (player.queue.size >= maxQueueSize)
            throw new TypeError(`Max queue size of \`${maxQueueSize}\` reached.`);

        const savedGuild = await this.guilds.get(ctx.guild);
        const track = await this.music
            .findTrack(query, ctx.member, savedGuild.music.maxTrackLength);

        player.queue.add(track);
        if (player.playing)
            return ctx.channel.send(`**Added**: \`${track.title}\` to list.`);

        player.play();
    }
}
