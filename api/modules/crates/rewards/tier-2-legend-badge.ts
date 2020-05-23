import Reward, { RewardType } from "./reward";
import { UserDocument, BadgeType } from "../../../../data/models/user";

export default class Tier2LegendBadgeReward implements Reward {
    type = RewardType.Tier3LegendBadge;
    rarity = 4;

    give(savedUser: UserDocument) {
        const hasBadge = savedUser.badges
            .some(b => b.type === BadgeType.Legend && b.tier <= 2);
        if (hasBadge) return false;

        const currentBadge = savedUser.badges
            .find(b => b.type === BadgeType.Legend);
        if (currentBadge)
            currentBadge.tier = 2;
        else {
            savedUser.badges.push({
                at: new Date(),
                tier: 2,
                type: BadgeType.Legend
            });
        }

        return true;
    }
}