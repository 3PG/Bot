import { model, Schema, Document } from 'mongoose';

export class XPCard {
    backgroundURL = '';
    primary = '';
    secondary = '';
    tertiary = '';
}

const userSchema = new Schema({
    _id: String,
    premium: { type: Boolean, default: false },
    premiumExpiration: { type: Date, default: null },
    votes: { type: Number, default: 0 },
    xpCard: { type: Object, default: new XPCard() }
});

export interface UserDocument extends Document {
    _id: string;
    premium: boolean;
    premiumExpiration: Date,
    xpCard: XPCard;
    votes: number;
}

export interface Badge {
    at: Date;
    type: BadgeType;
    tier?: number;
}

export enum BadgeType {
  Alpha = 'ALPHA',
  BugDestroyer = 'BUG_DESTROYER',
  EarlySupporter = 'EARLY_SUPPORTER',
  Legend = 'LEGEND',
  Pro = 'PRO'
}


export const SavedUser = model<UserDocument>('user', userSchema);