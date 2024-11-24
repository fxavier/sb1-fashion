import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.model';
import Token from '../models/token.model';

const generateTokens = (userId: string, isAdmin: boolean) => {
  const accessToken = jwt.sign(
    { userId, isAdmin },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );

  const refreshToken = crypto.randomBytes(40).toString('hex');
  return { accessToken, refreshToken };
};

const generateOTP = (): number => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, phone } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const verificationOtp = generateOTP();
    const verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = new User({
      email,
      passwordHash: password,
      name,
      phone,
      verificationOtp,
      verificationOtpExpires,
      cart: [],
      wishlist: []
    });
    await user.save();

    // TODO: Send OTP via SMS using your preferred SMS service
    console.log(`Verification OTP for ${phone}: ${verificationOtp}`);

    const tokens = generateTokens(user._id.toString(), user.isAdmin);
    
    const token = new Token({
      userId: user._id,
      refreshToken: tokens.refreshToken,
      accessToken: tokens.accessToken
    });
    await token.save();

    res.status(201).json({
      user,
      ...tokens,
      message: 'Please verify your phone number with the OTP sent'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyPhone = async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    const userId = req.user?.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Phone already verified' });
    }

    if (!user.verificationOtp || !user.verificationOtpExpires) {
      return res.status(400).json({ message: 'No OTP found' });
    }

    if (user.verificationOtp !== parseInt(otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.verificationOtpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    await user.save();

    res.json({ message: 'Phone verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const resendVerificationOTP = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Phone already verified' });
    }

    const verificationOtp = generateOTP();
    const verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationOtp = verificationOtp;
    user.verificationOtpExpires = verificationOtpExpires;
    await user.save();

    // TODO: Send OTP via SMS
    console.log(`New verification OTP for ${user.phone}: ${verificationOtp}`);

    res.json({ message: 'New OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetPasswordOtp = generateOTP();
    const resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordOtp = resetPasswordOtp;
    user.resetPasswordOtpExpires = resetPasswordOtpExpires;
    await user.save();

    // TODO: Send OTP via SMS
    console.log(`Password reset OTP for ${phone}: ${resetPasswordOtp}`);

    res.json({ message: 'Password reset OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { phone, otp, newPassword } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res.status(400).json({ message: 'No reset OTP found' });
    }

    if (user.resetPasswordOtp !== parseInt(otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.resetPasswordOtpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    user.passwordHash = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your phone number first' });
    }

    const tokens = generateTokens(user._id.toString(), user.isAdmin);
    
    const token = new Token({
      userId: user._id,
      refreshToken: tokens.refreshToken,
      accessToken: tokens.accessToken
    });
    await token.save();

    res.json({
      user,
      ...tokens
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId)
      .select('-passwordHash -verificationOtp -verificationOtpExpires -resetPasswordOtp -resetPasswordOtpExpires')
      .populate('cart')
      .populate('wishlist.productId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      street,
      apartment,
      city,
      postalCode,
      country
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      {
        name,
        phone,
        street,
        apartment,
        city,
        postalCode,
        country
      },
      { new: true }
    ).select('-passwordHash -verificationOtp -verificationOtpExpires -resetPasswordOtp -resetPasswordOtpExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};