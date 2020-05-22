import Reward, { RewardType } from './rewards/reward';
import Log from '../../../utils/log';
import { UserDocument } from '../../../data/models/user';
import fs from 'fs';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);

export default class Crates {
    rewards: Reward[] = [];

    async init() {
        const directory = './api/modules/crates/rewards';
        const files = await readdir(directory);

        for (const file of files) {
            const Reward = require(`./rewards/${file}`).default;
            if (!Reward) continue;

            this.rewards.push(new Reward());
        }
        Log.info(`Loaded: ${this.rewards.length} rewards`, `crates`);
    }

    open(savedUser: UserDocument) {
        savedUser.crates--;

        const reward = this.roll();
        reward.give(savedUser);
    }

    private roll() {
        let reward = this.rewards[0];
        const roll = Math.random() * 100;
        for (let i = 0; i < Object.keys(RewardType).length; i++) {
            const prereq = 100 / (2 * i);
            if (roll > prereq) continue;

            reward = this.rewards[i];
        }
        return reward;
    }
}