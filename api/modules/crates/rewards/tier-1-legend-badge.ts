import Reward, { RewardType } from "./reward";
import { UserDocument, BadgeType } from "../../../../data/models/user";

export default class Tier1LegendBadgeReward implements Reward {
    type: RewardType.Tier1LegendBadge;

    give(savedUser: UserDocument) {
        const hasBadge = savedUser.badges
            .some(b => b.type === BadgeType.Legend && b.tier === 1);
        if (hasBadge) return false;

        savedUser.badges.push({
            at: new Date(),
            tier: 3,
            type: BadgeType.Legend
        });

        return true;
    }
}