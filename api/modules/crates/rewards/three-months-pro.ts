import Reward, { RewardType } from "./reward";
import { UserDocument, BadgeType } from "../../../../data/models/user";

export default class ThreeMonthsPROReward implements Reward {
    type: RewardType.ThreeMonthsPRO;

    give(savedUser: UserDocument) {
        const date = savedUser.premiumExpiration;
        date.setDate(date.getDate() + 90);

        savedUser.premiumExpiration = date;
        savedUser.premium = true;
        return true;
    }
}