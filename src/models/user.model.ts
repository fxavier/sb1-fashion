import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IWishlistItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  productImage: string;
  productPrice: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  paymentCustomerId?: string;
  street?: string;
  apartment?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone: string;
  isAdmin: boolean;
  isVerified: boolean;
  verificationOtp?: number;
  verificationOtpExpires?: Date;
  resetPasswordOtp?: number;
  resetPasswordOtpExpires?: Date;
  cart: mongoose.Types.ObjectId[];
  wishlist: IWishlistItem[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  paymentCustomerId: String,
  street: String,
  apartment: String,
  city: String,
  postalCode: String,
  country: String,
  phone: { type: String, required: true, trim: true },
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  verificationOtp: Number,
  verificationOtpExpires: Date,
  resetPasswordOtp: Number,
  resetPasswordOtpExpires: Date,
  cart: [{ type: Schema.Types.ObjectId, ref: 'CartProduct' }],
  wishlist: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      productName: { type: String, required: true },
      productImage: { type: String, required: true },
      productPrice: { type: Number, required: true },
    },
  ],
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.model<IUser>('User', userSchema);