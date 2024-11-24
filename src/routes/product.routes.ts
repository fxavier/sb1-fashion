import express from 'express';
import { body, query } from 'express-validator';
import * as productController from '../controllers/product.controller';
import { auth, adminAuth } from '../middleware/auth.middleware';
import { upload, handleUploadError } from '../middleware/upload.middleware';
import { paginationMiddleware } from '../middleware/pagination.middleware';

const router = express.Router();

// Get all products with filters
router.get('/', [
  paginationMiddleware(10, 50),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('sort').optional().matches(/^[a-zA-Z]+:(asc|desc)$/),
], productController.getAllProducts);

// Search products
router.get('/search', [
  paginationMiddleware(10, 50),
  query('q').notEmpty().trim(),
], productController.searchProducts);

// Get products by category
router.get('/category/:categoryId', [
  paginationMiddleware(10, 50),
  query('sort').optional().matches(/^[a-zA-Z]+:(asc|desc)$/),
], productController.getProductsByCategory);

// Get single product
router.get('/:id', productController.getProduct);

// Create product (admin only)
router.post('/', [
  auth,
  adminAuth,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 5 }
  ]),
  handleUploadError,
  body('name').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('price').isFloat({ min: 0 }),
  body('colours').isArray(),
  body('sizes').isArray(),
  body('category').isMongoId(),
  body('genderAgeCategory').isIn(['men', 'women', 'unisex', 'kids']),
  body('countInStock').isInt({ min: 0, max: 255 })
], productController.createProduct);

// Update product (admin only)
router.put('/:id', [
  auth,
  adminAuth,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 5 }
  ]),
  handleUploadError,
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('colours').optional().isArray(),
  body('sizes').optional().isArray(),
  body('category').optional().isMongoId(),
  body('genderAgeCategory').optional().isIn(['men', 'women', 'unisex', 'kids']),
  body('countInStock').optional().isInt({ min: 0, max: 255 })
], productController.updateProduct);

// Delete product (admin only)
router.delete('/:id', [auth, adminAuth], productController.deleteProduct);

export default router;