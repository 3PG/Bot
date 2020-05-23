import Reward, { RewardType } from "./reward";
import { UserDocument, BadgeType } from "../../../../data/models/user";

export default class ThreeMonthsPROReward implements Reward {
    type = RewardType.ThreeMonthsPRO;
    rarity = 8;

    give(savedUser: UserDocument) {
        const expiration = (savedUser.premiumExpiration > new Date())
            ? savedUser.premiumExpiration
            : new Date();

        expiration.setDate(expiration.getDate() + 90);

        savedUser.premiumExpiration = expiration;
        savedUser.premium = true;

        return true;
    }
}