import { Request, Response } from 'express';
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

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const token = await Token.findOne({ refreshToken });
    if (!token) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(token.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tokens = generateTokens(user._id.toString(), user.isAdmin);
    
    // Update token in database
    token.refreshToken = tokens.refreshToken;
    token.accessToken = tokens.accessToken;
    await token.save();

    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    await Token.findOneAndDelete({ refreshToken });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};