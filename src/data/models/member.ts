import { model, Schema, Document } from 'mongoose';

const memberSchema = new Schema({
  userId: String,
  guildId: String,
  xp: { type: Number, default: 0 },
  recentMessages: { type: Array, default: [] },
  warnings: { type: Array, default: [] },
  mutes: { type: Array, default: [] }
});

export interface MemberDocument extends Document {
  userId: string;
  guildId: string;
  xp: number;
  recentMessages: Date[];
  warnings: Punishment[];
  mutes: Punishment[];
}

export interface Punishment {
  reason: string;
  instigatorId: string;
  at: Date;
}

export const SavedMember = model<MemberDocument>('member', memberSchema);