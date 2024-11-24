import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';

const router = express.Router();

router.post('/refresh', [
  body('refreshToken').notEmpty()
], authController.refresh);

router.post('/logout', [
  body('refreshToken').notEmpty()
], authController.logout);

export default router;