import { GuildMember } from "discord.js";

export function getMemberFromMention(mention: string, guild: any): GuildMember {    
  const id = mention?.replace(/^<@!?(\d+)>$/gm, '$1') ?? '';
  const member = guild.members.cache.get(id);        
  if (!member)
    throw new TypeError('Member not found.');
  
  return member;
}

export function createUUID() {
  let time = new Date().getTime();
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let random = (time + Math.random() * 16) % 16 | 0;
    time = Math.floor(time / 16);
    return ((c == 'x') ? random :(random&0x3|0x8)).toString(16);
  });
  return uuid;
}

export function parseDuration(str: string) {
  if (!str || str == '-1' || str.toLowerCase() == 'forever')
    return -1;

  const letters = str.match(/[a-z]/g).join('');
  const time = Number(str.match(/[0-9]/g).join(''));

  switch (letters) {
    case 'y': return time * 1000 * 60 * 60 * 24 * 365;
    case 'mo': return time * 1000 * 60 * 60 * 24 * 30;
    case 'w': return time * 1000 * 60 * 60 * 24 * 7;
    case 'd': return time * 1000 * 60 * 60 * 24;
    case 'h': return time * 1000 * 60 * 60;
    case 'm': return time * 1000 * 60;
    case 's': return time * 1000;
  }
  throw new TypeError('Could not parse duration. Make sure you typed the duration correctly.');
}