import CommandService from '../../../services/command.service';
import config from '../../../config.json';

describe('command.service', () => {
    let service: CommandService;

    beforeEach(() => {
        service = new CommandService();
    });

    it('too many commands are blocked by cooldown', () => {
        const msg = {
            guild: { id: config.tests.guild.id }
        } as any;

        const result = service.handle(msg);
    });
});
