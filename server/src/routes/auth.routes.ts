import { Router } from 'express';
import {
  register,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  deleteAccount,
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validateRequest';
import { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from '@roleforge/shared';

const router = Router();

router.post('/register', authLimiter, validateRequest(RegisterSchema), register);
router.post('/login', authLimiter, validateRequest(LoginSchema), login);
router.post('/google', authLimiter, googleAuth);
router.post('/forgot-password', authLimiter, validateRequest(ForgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validateRequest(ResetPasswordSchema), resetPassword);

// Protected routes
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);
router.delete('/account', requireAuth, deleteAccount);

export default router;

