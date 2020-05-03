import config from '../../config.json';
import { ErelaClient, Player } from 'erela.js';
import { bot } from '../../bot';
import Log from '../../utils/log';
import { CommandContext } from '../../commands/command';

export default class Music {
    private _client = {} as ErelaClient;
    get client() { return this._client; }

    initialize() {
        const nodes = [{
            host: 'localhost',
            port: 2333,
            password: (config as any).lavalink.password,
        }];
        const music = new ErelaClient(bot, nodes);

        this.hookEvents(music);

        this._client = music;        
    }

    private hookEvents(music: ErelaClient) {
        music.on('nodeConnect', () => Log.info('Connected to Lavalink node', 'music'));
        music.on('nodeError', (node, error) => Log.error(error, 'music'));
        music.on('trackStuck', (player) => player.textChannel.send('❗ Error loading track.'));
        music.on('trackStart', (player, track) => player.textChannel.send(`**Now Playing**: \`${track.title}\` 🎵`));
        music.on('queueEnd', (player) => {
            player.textChannel.send('Queue has ended.');
            music.players.destroy(player.guild.id);
        });
    }

    joinAndGetPlayer(ctx: CommandContext) {
        const voiceChannel = ctx.member.voice.channel;
        if (!voiceChannel)
            throw new TypeError('You must be in a voice channel to play music.');

        return this.client.players.spawn({
            guild: ctx.guild,
            voiceChannel: voiceChannel,
            textChannel: ctx.channel,
        });
    }

    getDurationString(player: Player, trackIndex = 0) {
        if (!player.playing)
            throw new TypeError('No track is currently playing.');

        const positionInSeconds = player.position / 1000;
        const durationInSeconds = player.queue[trackIndex].duration / 1000;

        return `${Math.floor(positionInSeconds / 60)}:${Math.floor(positionInSeconds % 60).toString().padStart(2, '0')} / ` +
            `${Math.floor(durationInSeconds / 60)}:${Math.floor(durationInSeconds % 60).toString().padStart(2, '0')}`;
    }
}
