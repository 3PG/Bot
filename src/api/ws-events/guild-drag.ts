import { Socket } from 'socket.io';
import Users from '../../data/users';
import Deps from '../../utils/deps';
import { WebSocket } from '../websocket';
import WSEvent from './ws-event';

export default class implements WSEvent {
  on = 'GUILD_DRAG';

  constructor(private users = Deps.get<Users>(Users)) {}

  async invoke(ws: WebSocket, client: Socket, { userId, guildPositions }: any) {
  const savedUser = await this.users.get({ id: userId });
  savedUser.guildPositions = guildPositions;
  await savedUser.save();
  }
}