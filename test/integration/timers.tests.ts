import Timers from '../../src/modules/timers/timers';
import { expect } from 'chai';
import { SavedGuild, GuildDocument } from '../../src/data/models/guild';

describe('modules/timers', () => {
  let commandsService: any;
  let guilds: any;
  let savedGuild: GuildDocument;
  let timers: Timers;

  beforeEach(() => {
    savedGuild = new SavedGuild();

    commandsService = {};
    guilds = { get: () => savedGuild };

    timers = new Timers(commandsService, guilds);
  });

  it('cancelTimers, removes timers for a guild', () => {
    timers.startTimers('123');

    timers.endTimers('123');

    const result = timers.get('123').length;
    expect(result).to.equal(0);
  });

  it('startTimers, starts all saved timers for a guild', async() => {
    savedGuild.timers.messageTimers.push({
      enabled: true,
      interval: '00:10',
      from: new Date(),
      channel: null,
      message: ''
    });
    savedGuild.timers.commandTimers.push({
      enabled: true,
      interval: '00:10',
      from: new Date(),
      channel: '',
      command: 'ping'
    });

    await timers.startTimers('123');

    const result = timers.get('123').length;
    expect(result).to.equal(2);
  });

  it('startTimers, more than 8 scheduled tasks and no PRO, extra tasks not added')

  it('getInterval, returns hours interval in milliseconds', () => {
    const expected = 60 * 60 * 1000;
    const result = timers.getInterval('01:00');

    expect(result).to.equal(expected);
  });

  it('getInterval, returns hours and minutes interval in milliseconds', () => {
    const expected = (60 * 60 * 1000) + (45 * 60 * 1000);
    const result = timers.getInterval('01:45');

    expect(result).to.equal(expected);
  });
});