import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Product from '../models/product.model';
import { ImageService } from '../services/image.service';
import { createPaginatedResponse } from '../utils/pagination.utils';

const imageService = new ImageService();

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const {
      category,
      name,
      genderAgeCategory,
      minPrice,
      maxPrice,
      colours,
      sizes,
    } = req.query;

    const { page, limit, sort } = req.pagination;

    const query: any = {};

    // Category filter
    if (category) {
      query.category = category;
    }

    // Name search with case-insensitive partial match
    if (name) {
      query.name = { $regex: new RegExp(String(name), 'i') };
    }

    if (genderAgeCategory) query.genderAgeCategory = genderAgeCategory;
    if (colours) query.colours = { $in: (colours as string).split(',') };
    if (sizes) query.sizes = { $in: (sizes as string).split(',') };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOptions: any = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOptions[field] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions.dateAdded = -1;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('category')
        .populate({
          path: 'reviews',
          populate: {
            path: 'user',
            select: 'name'
          }
        }),
      Product.countDocuments(query)
    ]);

    const response = createPaginatedResponse(products, total, page, limit);
    response.filters = {
      appliedCategory: category || null,
      appliedName: name || null,
      appliedPriceRange: minPrice || maxPrice ? { min: minPrice, max: maxPrice } : null,
      appliedColours: colours ? (colours as string).split(',') : null,
      appliedSizes: sizes ? (sizes as string).split(',') : null,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const { page, limit } = req.pagination;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchRegex = new RegExp(String(q), 'i');
    const query = {
      $or: [
        { name: searchRegex },
        { description: searchRegex }
      ]
    };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category')
        .sort({ dateAdded: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(query)
    ]);

    res.json(createPaginatedResponse(products, total, page, limit));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { page, limit, sort } = req.pagination;

    const sortOptions: any = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOptions[field] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions.dateAdded = -1;
    }

    const [products, total] = await Promise.all([
      Product.find({ category: categoryId })
        .populate('category')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments({ category: categoryId })
    ]);

    res.json(createPaginatedResponse(products, total, page, limit));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ... rest of the controller methods remain the same