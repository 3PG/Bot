import Reward, { RewardType } from './rewards/reward';
import Log from '../../../utils/log';
import { UserDocument } from '../../../data/models/user';
import fs from 'fs';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);

export default class Crates {
    rewards: Reward[] = [];

    async init() {
        const files = await readdir('./src/api/modules/crates/rewards');

        for (const fileName of files) {
            const cleanName = fileName.replace(/(\..*)/, '');
            
            const Reward = require(`./rewards/${cleanName}`).default;
            if (!Reward) continue;

            const reward: Reward = new Reward();            
            this.rewards[reward.rarity - 1] = reward;
        }
        
        Log.info(`Loaded: ${this.rewards.length} rewards`, `crates`);
    }

    open(savedUser: UserDocument) {
        savedUser.crates--;

        const reward = this.roll();
        const given = reward.give(savedUser);
        return {
            given,
            type: reward.type
        };
    }

    private roll() {
        let reward = this.rewards[0];

        const difficulty = 2;

        const roll = Math.random();
        for (let i = 0; i < this.rewards.length; i++) {
            const prereq = 1 / (i + 1)**difficulty;
            if (roll > prereq) continue;

            reward = this.rewards[i];
        }
        return reward;
    }
}