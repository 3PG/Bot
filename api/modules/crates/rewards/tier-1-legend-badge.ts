import Reward, { RewardType } from "./reward";
import { UserDocument, BadgeType } from "../../../../data/models/user";

export default class Tier1LegendBadgeReward implements Reward {
    type = RewardType.Tier1LegendBadge;
    rarity = 5;

    give(savedUser: UserDocument) {
        const hasBadge = savedUser.badges
            .some(b => b.type === BadgeType.Legend && b.tier === 1);
        if (hasBadge) return false;

        const currentBadge = savedUser.badges
            .find(b => b.type === BadgeType.Legend);
        if (currentBadge)
            currentBadge.tier = 1;
        savedUser.badges.push({
            at: new Date(),
            tier: 1,
            type: BadgeType.Legend
        });

        return true;
    }
}