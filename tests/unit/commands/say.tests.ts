import SayCommand from "../../../commands/say";
import { expect } from "chai";

describe('commands/say', () => {
    it('sends args to channel', () => {
        const result = new SayCommand().execute({ channel: { send: (msg) => msg }} as any, 'testing 321 123');

        expect(result).to.equal('testing 321 123');
    });
})