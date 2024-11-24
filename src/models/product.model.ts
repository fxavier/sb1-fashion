import mongoose, { Document, Schema } from 'mongoose';
import { IReview } from './review.model';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  rating: number;
  colours: string[];
  image: string;
  images: string[];
  reviews: IReview[];
  numberOfReviews: number;
  sizes: string[];
  category: mongoose.Types.ObjectId;
  genderAgeCategory: 'men' | 'women' | 'unisex' | 'kids';
  countInStock: number;
  dateAdded: Date;
}

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0.0 },
  colours: [{ type: String }],
  image: { type: String, required: true },
  images: [{ type: String }],
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  numberOfReviews: { type: Number, default: 0 },
  sizes: [{ type: String }],
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  genderAgeCategory: { 
    type: String, 
    enum: ['men', 'women', 'unisex', 'kids'],
    required: true
  },
  countInStock: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 255 
  },
  dateAdded: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model<IProduct>('Product', productSchema);