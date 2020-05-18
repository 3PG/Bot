import AnnounceHandler from '../handlers/announce-handler';
import { EventType } from '../../data/models/guild';
import EventVariables from '../../modules/announce/event-variables';
import { LevelUpEventArgs } from '../../modules/xp/leveling';

export default class LevelUpHandler extends AnnounceHandler {
    on = 'levelUp';
    event = EventType.LevelUp;

    async invoke(args: LevelUpEventArgs) {        
        await super.announce(args.guild, [ args ]);
    }
    
    protected async applyEventVariables(content: string, args: LevelUpEventArgs) {
        return new EventVariables(content)
            .guild(args.guild)
            .memberCount(args.guild)
            .user(args.user)
            .oldLevel(args.oldLevel)
            .newLevel(args.newLevel)
            .xp(args.xp)
            .toString();
    }
}
