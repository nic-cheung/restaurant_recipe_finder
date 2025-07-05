import { Response } from 'express';
import { ZodError } from 'zod';
import { AuthenticatedRequest } from '../utils/jwt';
import {
  userPreferencesSchema,
  updateUserPreferencesSchema,
  UserPreferencesInput,
  UpdateUserPreferencesInput,
  COMMON_DIETARY_RESTRICTIONS,
  COMMON_ALLERGIES,
  COMMON_CUISINES,
} from '../utils/validation';
import {
  getUserPreferences,
  getUserPreferencesWithDefaults,
  upsertUserPreferences,
  updateUserPreferences,
  deleteUserPreferences,
  getPreferencesSummary as getPreferencesSummaryService,
} from '../services/preferencesService';

/**
 * Get user preferences
 */
export const getPreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const preferences = await getUserPreferencesWithDefaults(req.user.userId);

    res.status(200).json({
      success: true,
      data: {
        preferences,
      },
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Update user preferences (full update/create)
 */
export const updatePreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    // Validate input
    const validatedData: UserPreferencesInput = userPreferencesSchema.parse(req.body);

    // Upsert preferences
    const preferences = await upsertUserPreferences(req.user.userId, validatedData);

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }

    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Partially update user preferences
 */
export const patchPreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    // Validate input
    const validatedData: UpdateUserPreferencesInput = updateUserPreferencesSchema.parse(req.body);

    // Update preferences
    const preferences = await updateUserPreferences(req.user.userId, validatedData);

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }

    if (error instanceof Error) {
      if (error.message === 'User preferences not found') {
        res.status(404).json({
          success: false,
          error: 'User preferences not found. Please create preferences first.',
        });
        return;
      }
    }

    console.error('Patch preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Delete user preferences
 */
export const deletePreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    await deleteUserPreferences(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Preferences deleted successfully',
    });
  } catch (error) {
    console.error('Delete preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get preferences summary for recipe generation
 */
export const getPreferencesSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const summary = await getPreferencesSummaryService(req.user.userId);

    res.status(200).json({
      success: true,
      data: {
        summary,
      },
    });
  } catch (error) {
    console.error('Get preferences summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get common options for preferences (dietary restrictions, allergies, cuisines)
 */
export const getPreferencesOptions = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      data: {
        dietaryRestrictions: COMMON_DIETARY_RESTRICTIONS,
        allergies: COMMON_ALLERGIES,
        cuisines: COMMON_CUISINES,
        skillLevels: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
      },
    });
  } catch (error) {
    console.error('Get preferences options error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}; 