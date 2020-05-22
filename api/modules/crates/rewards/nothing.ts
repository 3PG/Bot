import Reward, { RewardType } from "./reward";

export default class NothingReward implements Reward {
    type: RewardType.Nothing;

    give() { return true; }
}