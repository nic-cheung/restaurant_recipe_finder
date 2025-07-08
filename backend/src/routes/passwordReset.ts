import { Router } from 'express';
import { forgotPassword, resetPassword, validateResetToken } from '../controllers/passwordResetController';

const router = Router();

// @route   POST /api/password-reset/forgot
// @desc    Request password reset email
// @access  Public
router.post('/forgot', forgotPassword);

// @route   POST /api/password-reset/reset
// @desc    Reset password with token
// @access  Public
router.post('/reset', resetPassword);

// @route   GET /api/password-reset/validate
// @desc    Validate password reset token
// @access  Public
router.get('/validate', validateResetToken);

export default router; 