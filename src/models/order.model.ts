import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  productName: string;
  productImage: string;
  productPrice: number;
  quantity: number;
  selectedSize?: string;
  selectedColour?: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: string;
  city: string;
  postalCode?: string;
  country: string;
  phone: string;
  paymentId?: string;
  status: 'pending' | 'processed' | 'shipped' | 'out-for-delivery' | 'delivered' | 'cancelled' | 'on-hold' | 'expired';
  statusHistory: string[];
  totalPrice: number;
  dateOrdered: Date;
}

const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  productPrice: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  selectedSize: String,
  selectedColour: String,
});

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: String,
  country: { type: String, required: true },
  phone: { type: String, required: true },
  paymentId: String,
  status: {
    type: String,
    required: true,
    default: 'pending',
    enum: [
      'pending',
      'processed',
      'shipped',
      'out-for-delivery',
      'delivered',
      'cancelled',
      'on-hold',
      'expired'
    ]
  },
  statusHistory: {
    type: [String],
    enum: [
      'pending',
      'processed',
      'shipped',
      'out-for-delivery',
      'delivered',
      'cancelled',
      'on-hold',
      'expired'
    ],
    required: true,
    default: ['pending']
  },
  totalPrice: { type: Number, required: true },
  dateOrdered: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Pre-save middleware to update status history
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push(this.status);
  }
  next();
});

export default mongoose.model<IOrder>('Order', orderSchema);