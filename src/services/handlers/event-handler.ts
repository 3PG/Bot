import { ClientEvents } from 'discord.js';

export default interface EventHandler {
  on: keyof ClientEvents | any;

  invoke(...args: any[]): Promise<any> | void;
}