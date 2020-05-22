import Reward, { RewardType } from "./reward";
import { UserDocument, BadgeType } from "../../../../data/models/user";

export default class OneMonthPROReward implements Reward {
    type: RewardType.OneMonthPRO;

    give(savedUser: UserDocument) {
        const date = savedUser.premiumExpiration;
        date.setDate(date.getDate() + 30);

        savedUser.premiumExpiration = date;
        savedUser.premium = true;
        return true;
    }
}