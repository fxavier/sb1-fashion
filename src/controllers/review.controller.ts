import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Review from '../models/review.model';
import Product from '../models/product.model';
import User from '../models/user.model';

export const createReview = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      user: userId,
      userName: user.name,
      rating,
      comment,
    });

    await review.save();

    // Update product's review statistics
    product.reviews.push(review._id);
    product.numberOfReviews = product.reviews.length;
    
    // Calculate new average rating
    const reviews = await Review.find({ _id: { $in: product.reviews } });
    const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
    product.averageRating = Math.round(averageRating * 10) / 10;

    await product.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.userId;

    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    // Update product's average rating
    const product = await Product.findOne({ reviews: reviewId });
    if (product) {
      const reviews = await Review.find({ _id: { $in: product.reviews } });
      const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
      product.averageRating = Math.round(averageRating * 10) / 10;
      await product.save();
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.userId;

    const review = await Review.findOneAndDelete({ _id: reviewId, user: userId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Update product's review statistics
    const product = await Product.findOne({ reviews: reviewId });
    if (product) {
      product.reviews = product.reviews.filter(id => id.toString() !== reviewId);
      product.numberOfReviews = product.reviews.length;
      
      if (product.reviews.length > 0) {
        const reviews = await Review.find({ _id: { $in: product.reviews } });
        const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
        product.averageRating = Math.round(averageRating * 10) / 10;
      } else {
        product.averageRating = 0;
      }

      await product.save();
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};