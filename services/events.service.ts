import { bot, emitter } from '../bot';
import Log from '../utils/log';

import MemberJoinHandler from './handlers/member-join.handler';
import MemberLeaveHandler from './handlers/member-leave.handler';
import MessageDeleteHandler from './handlers/message-deleted.handler';
import EventHandler from './handlers/event-handler';
import ReadyHandler from './handlers/ready.handler';
import GuildCreateHandler from './handlers/guildCreate.handler';
import MessageHandler from './handlers/message.handler';
import MessageReactionAddHandler from './handlers/message-reaction-add.handler';
import MessageReactionRemoveHandler from './handlers/message-reaction-remove.handler';
import LevelUpHandler from './custom-handlers/level-up.handler';
import UserWarnHandler from './custom-handlers/user-warn.handler';
import ConfigUpdateHandler from './custom-handlers/config-update.handler';
import UserMuteHandler from './custom-handlers/user-mute.handler';

export default class EventsService {
    private readonly handlers: EventHandler[] = [
        new ReadyHandler(),
        new GuildCreateHandler(),
        new MessageHandler(),
        new MemberJoinHandler(),
        new MemberLeaveHandler(),
        new MessageDeleteHandler(),
        new MessageReactionAddHandler(),
        new MessageReactionRemoveHandler()
    ];

    private readonly customHandlers: EventHandler[] = [
        new LevelUpHandler(),
        new UserWarnHandler(),
        new ConfigUpdateHandler(),
        new UserMuteHandler()
    ];

    constructor() {
        for (const handler of this.handlers)
            bot.on(handler.on, handler.invoke.bind(handler));
        
        for (const handler of this.customHandlers)
            emitter.on(handler.on, handler.invoke.bind(handler));
            
        Log.info(`Loaded: ${this.handlers.length} handlers`, 'events');
        Log.info(`Loaded: ${this.customHandlers.length} custom handlers`, 'events');
    }
}