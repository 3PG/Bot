import { UserDocument } from "../../../../data/models/user";

export default interface Reward {
    type: RewardType;
    rarity: number;

    give(savedUser: UserDocument): boolean;
}

export enum RewardType {
    Nothing = 'NOTHING',
    VoteCrate = 'VOTE_CRATE',
    Tier3LegendBadge = 'TIER_3_LEGEND_BADGE',
    Tier2LegendBadge = 'TIER_2_LEGEND_BADGE',
    Tier1LegendBadge = 'TIER_1_LEGEND_BADGE',
    SevenDaysPRO = 'SEVEN_DAYS_PRO',
    OneMonthPRO = 'ONE_MONTH_PRO',
    ThreeMonthsPRO = 'THREE_MONTHS_PRO'
}