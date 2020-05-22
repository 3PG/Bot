import { UserDocument } from "../../../../data/models/user";

export default interface Reward {
    type: RewardType;

    give(savedUser: UserDocument): boolean;
}

export enum RewardType {
    Nothing, VoteCrate, Tier3LegendBadge, SevenDaysPRO, Tier2LegendBadge, OneMonthPRO, Tier1LegendBadge, ThreeMonthsPRO
}