import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Order from '../models/order.model';
import Product from '../models/product.model';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, shippingAddress, city, country, phone, postalCode } = req.body;
    let totalPrice = 0;
    const orderItems = [];

    // Validate products and prepare order items
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      if (product.countInStock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      orderItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.image,
        productPrice: product.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColour: item.selectedColour
      });

      totalPrice += product.price * item.quantity;
      
      // Update stock
      product.countInStock -= item.quantity;
      await product.save();
    }

    const order = new Order({
      user: req.user?.userId,
      items: orderItems,
      shippingAddress,
      city,
      country,
      phone,
      postalCode,
      totalPrice,
      status: 'pending',
      statusHistory: ['pending']
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user?.userId })
      .populate('items.product')
      .sort({ dateOrdered: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user?.userId
    }).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ dateOrdered: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};