import AnnounceHandler from '../handlers/announce-handler';
import { EventType } from '../../data/models/guild';
import EventVariables from '../../modules/announce/event-variables';
import { UserPunishmentArgs } from '../../modules/auto-mod/auto-mod';

export default class UserWarnHandler extends AnnounceHandler {
    on = 'userUnmute';
    event = EventType.Unmute;

    async invoke(args: UserPunishmentArgs) {  
        await super.announce(args.guild, [ args ]);
    }
    
    protected async applyEventVariables(content: string, args: UserPunishmentArgs) {        
        return new EventVariables(content)
            .guild(args.guild)
            .instigator(args.instigator)
            .memberCount(args.guild)
            .reason(args.reason)
            .user(args.user)
            .warnings(args.warnings)
            .toString();
    }
}
