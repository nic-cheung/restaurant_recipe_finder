import { Router, Request, Response } from 'express';

const router = Router();

// @route   POST /api/recipes/generate
// @desc    Generate AI recipe - placeholder for testing
// @access  Private
router.post('/generate', async (_req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Recipe generation endpoint - will be implemented after user preferences testing',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

export default router; 