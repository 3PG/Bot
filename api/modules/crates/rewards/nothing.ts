import Reward, { RewardType } from "./reward";

export default class NothingReward implements Reward {
    type = RewardType.Nothing;
    rarity = 1;

    give() { return true; }
}