import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getPreferences,
  updatePreferences,
  patchPreferences,
  deletePreferences,
  getPreferencesSummary,
  getPreferencesOptions,
} from '../controllers/preferencesController';

const router = Router();

// @route   GET /api/preferences
// @desc    Get user preferences
// @access  Private
router.get('/', authenticateToken, getPreferences);

// @route   PUT /api/preferences
// @desc    Update user preferences (full update/create)
// @access  Private
router.put('/', authenticateToken, updatePreferences);

// @route   PATCH /api/preferences
// @desc    Partially update user preferences
// @access  Private
router.patch('/', authenticateToken, patchPreferences);

// @route   DELETE /api/preferences
// @desc    Delete user preferences
// @access  Private
router.delete('/', authenticateToken, deletePreferences);

// @route   GET /api/preferences/summary
// @desc    Get preferences summary for recipe generation
// @access  Private
router.get('/summary', authenticateToken, getPreferencesSummary);

// @route   GET /api/preferences/options
// @desc    Get common options for preferences
// @access  Private
router.get('/options', authenticateToken, getPreferencesOptions);

export default router; 