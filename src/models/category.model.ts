import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  image?: string;
  parent?: mongoose.Types.ObjectId;
  color: string;
}

const categorySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  parent: { type: Schema.Types.ObjectId, ref: 'Category' },
  color: { type: String, default: '#000000' }
}, {
  timestamps: true
});

export default mongoose.model<ICategory>('Category', categorySchema);