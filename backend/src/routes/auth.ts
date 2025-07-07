import { Router, Request, Response } from 'express';
import { register, login, logout, getCurrentUser, checkEmailAvailability, updatePassword } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/check-email
// @desc    Check if email is available for registration
// @access  Public
router.post('/check-email', checkEmailAvailability);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, logout);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateToken, getCurrentUser);

// @route   GET /api/auth/test-credentials
// @desc    Generate test credentials for development
// @access  Public (only in development)
router.get('/test-credentials', (_req: Request, res: Response) => {
  // Only allow in development environment
  if (process.env['NODE_ENV'] !== 'development') {
    return res.status(404).json({
      success: false,
      error: 'Not found'
    });
  }

  // Generate unique test credentials
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000);
  
  const testCredentials = {
    email: `test.${timestamp}.${randomNum}@test.local`,
    password: 'TestPass123!',
    name: `Test User ${timestamp.toString().slice(-4)}`
  };

  return res.json({
    success: true,
    data: testCredentials
  });
});

// @route   PUT /api/auth/password
// @desc    Update user password
// @access  Private
router.put('/password', authenticateToken, updatePassword);

export default router; 