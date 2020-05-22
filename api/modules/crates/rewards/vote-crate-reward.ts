import Reward, { RewardType } from "./reward";
import { UserDocument } from "../../../../data/models/user";

export default class VoteCrateReward implements Reward {
    type: RewardType.VoteCrate;

    give(savedUser: UserDocument) {
        savedUser.crates++;
        
        return true;
    }
}