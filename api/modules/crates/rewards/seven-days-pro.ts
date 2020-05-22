import Reward, { RewardType } from "./reward";
import { UserDocument, BadgeType } from "../../../../data/models/user";

export default class SevenDaysPROReward implements Reward {
    type: RewardType.SevenDaysPRO;

    give(savedUser: UserDocument) {
        const date = savedUser.premiumExpiration;
        date.setDate(date.getDate() + 7);

        savedUser.premiumExpiration = date;
        savedUser.premium = true;
        return true;
    }
}