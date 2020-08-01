import Ranks from '../../../../src/api/modules/ranks';
import { expect } from 'chai';

describe('api/ranks', () => {
    it('lowest xp messages returns lowest rank', () => {
        const members = [
            { xpMessages: '100', userId: '1' },
            { xpMessages: '200', userId: '2' },
            { xpMessages: '300', userId: '3' }
        ] as any;
        
        const result = Ranks.get(members[0], members);

        expect(result).to.equal(3);
    });

    it('highest xp messages returns highest rank', () => {
        const members = [
            { xpMessages: '100', userId: '1' },
            { xpMessages: '999', userId: '2' },
            { xpMessages: '300', userId: '3' }
        ] as any;
        
        const result = Ranks.get(members[1], members);

        expect(result).to.equal(1);
    });
});