import { UserDocument } from '../../../../data/models/user';

export default interface Reward {
    type: RewardType;
    rarity: number;

    give(savedUser: UserDocument): boolean;
}

export enum RewardType {
    Nothing = 'NOTHING',
    VoteCrate = 'VOTE_CRATE',
    SevenDaysPRO = 'SEVEN_DAYS_PRO',
    OneMonthPRO = 'ONE_MONTH_PRO',
    ThreeMonthsPRO = 'THREE_MONTHS_PRO'
}