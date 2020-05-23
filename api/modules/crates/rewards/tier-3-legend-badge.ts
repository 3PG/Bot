import Reward, { RewardType } from "./reward";
import { UserDocument, BadgeType } from "../../../../data/models/user";

export default class Tier3LegendBadgeReward implements Reward {
    type = RewardType.Tier3LegendBadge;
    rarity = 3;

    give(savedUser: UserDocument) {
        const hasBadge = savedUser.badges
            .some(b => b.type === BadgeType.Legend && b.tier <= 3);            
        if (hasBadge) return false;
        
        savedUser.badges.push({
            at: new Date(),
            tier: 3,
            type: BadgeType.Legend
        });

        return true;
    }
}