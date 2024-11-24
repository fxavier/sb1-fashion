import mongoose, { Document, Schema } from 'mongoose';

export interface ICartProduct extends Document {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  userId: mongoose.Types.ObjectId;
}

const cartProductSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ICartProduct>('CartProduct', cartProductSchema);