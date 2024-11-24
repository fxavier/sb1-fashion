import express from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', [
  body('email').isEmail().trim(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('phone').notEmpty().trim()
], userController.register);

router.post('/verify-phone', [
  auth,
  body('otp').isNumeric().isLength({ min: 6, max: 6 })
], userController.verifyPhone);

router.post('/resend-verification', auth, userController.resendVerificationOTP);

router.post('/request-password-reset', [
  body('phone').notEmpty().trim()
], userController.requestPasswordReset);

router.post('/reset-password', [
  body('phone').notEmpty().trim(),
  body('otp').isNumeric().isLength({ min: 6, max: 6 }),
  body('newPassword').isLength({ min: 6 })
], userController.resetPassword);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], userController.login);

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

export default router;