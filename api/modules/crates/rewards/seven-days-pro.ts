import Reward, { RewardType } from './reward';
import { UserDocument } from '../../../../data/models/user';

export default class SevenDaysPROReward implements Reward {
    type = RewardType.SevenDaysPRO;
    rarity = 6;

    give(savedUser: UserDocument) {
        const expiration = (savedUser.premiumExpiration > new Date())
            ? savedUser.premiumExpiration
            : new Date();

        expiration.setDate(expiration.getDate() + 7);

        savedUser.premiumExpiration = expiration;
        savedUser.premium = true;

        return true;
    }
}