import express from 'express';
import { body } from 'express-validator';
import * as orderController from '../controllers/order.controller';
import { auth, adminAuth } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', [
  auth,
  body('items').isArray(),
  body('shippingAddress').notEmpty(),
  body('city').notEmpty(),
  body('country').notEmpty(),
  body('phone').notEmpty()
], orderController.createOrder);

router.get('/my-orders', auth, orderController.getMyOrders);
router.get('/:id', auth, orderController.getOrder);
router.get('/', [auth, adminAuth], orderController.getAllOrders);

router.put('/:id/status', [
  auth,
  adminAuth,
  body('status').isIn([
    'pending',
    'processed',
    'shipped',
    'out-for-delivery',
    'delivered',
    'cancelled',
    'on-hold',
    'expired'
  ])
], orderController.updateOrderStatus);

export default router;