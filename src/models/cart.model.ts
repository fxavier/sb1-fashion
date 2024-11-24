import mongoose, { Document, Schema } from 'mongoose';

export interface ICart extends Document {
  product: mongoose.Types.ObjectId;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  productName: string;
  productImage: string;
  productPrice: number;
  reservationExpiry: Date;
  reserved: boolean;
}

const cartSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
  selectedSize: String,
  selectedColor: String,
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  productPrice: { type: Number, required: true },
  reservationExpiry: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 60 * 1000),
  },
  reserved: { type: Boolean, default: true },
}, {
  timestamps: true
});

// Add index for reservation expiry to automatically clean up expired reservations
cartSchema.index({ reservationExpiry: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<ICart>('Cart', cartSchema);