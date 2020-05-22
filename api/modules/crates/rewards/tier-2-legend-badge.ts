import Reward, { RewardType } from "./reward";
import { UserDocument, BadgeType } from "../../../../data/models/user";

export default class Tier2LegendBadgeReward implements Reward {
    type: RewardType.Tier3LegendBadge;

    give(savedUser: UserDocument) {
        const hasBadge = savedUser.badges
            .some(b => b.type === BadgeType.Legend && b.tier <= 2);
        if (hasBadge) return false;

        const currentBadge = savedUser.badges
            .find(b => b.type === BadgeType.Legend);

        savedUser.badges.push({
            at: new Date(),
            tier: 3,
            type: BadgeType.Legend
        });

        return true;
    }
}