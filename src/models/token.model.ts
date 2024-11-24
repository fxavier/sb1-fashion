import mongoose, { Document, Schema } from 'mongoose';

export interface IToken extends Document {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  accessToken?: string;
  createdAt: Date;
}

const tokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  refreshToken: { type: String, required: true },
  accessToken: String,
  createdAt: { type: Date, default: Date.now, expires: 60 * 86400 }
});

export default mongoose.model<IToken>('Token', tokenSchema);