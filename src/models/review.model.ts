import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  userName: string;
  comment?: string;
  rating: number;
  date: Date;
}

const reviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  comment: { type: String, trim: true },
  rating: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.model<IReview>('Review', reviewSchema);