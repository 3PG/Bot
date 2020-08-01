import Reward, { RewardType } from './reward';
import { UserDocument } from '../../../../data/models/user';

export default class OneMonthPROReward implements Reward {
    type = RewardType.OneMonthPRO;
    rarity = 7;

    give(savedUser: UserDocument) {
        const expiration = (savedUser.premiumExpiration > new Date())
            ? savedUser.premiumExpiration
            : new Date();

        expiration.setDate(expiration.getDate() + 30);

        savedUser.premiumExpiration = expiration;
        savedUser.premium = true;

        return true;
    }
}