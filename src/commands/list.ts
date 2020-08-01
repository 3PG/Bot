import { Command, CommandContext, Permission } from './command';
import Deps from '../utils/deps';
import Music from '../modules/music/music';
import { Track } from 'erela.js';

export default class ListCommand implements Command {
    precondition: Permission = '';
    name = 'list';
    summary = 'Display the current track list.';
    cooldown = 3;
    module = 'Music';

    constructor(private music = Deps.get<Music>(Music)) {}
    
    execute = async(ctx: CommandContext) => {
        const { queue } = this.music.joinAndGetPlayer(ctx.member, ctx.channel);

        let details = '';
        for (let i = 0; i < queue.length; i++) {            
            const track: Track = queue[i];
            const prefix = (i === 0) ? `**Now Playing**:` : `**[${i + 1}]**`;

            const mins = Math.floor(track.duration / 1000 / 60);
            const seconds = (track.duration / 1000) - (mins * 60);
            details += `${prefix} \`${track.title}\` from <@${track.requester.user.id}> \`${this.music.getLengthString(track)}\`\n`;
        }
        return ctx.channel.send(details || 'No tracks in list.');
    }
}
