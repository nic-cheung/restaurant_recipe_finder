import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { generateToken } from '../utils/jwt';
import { createUser, authenticateUser, getUserById, isEmailAvailable } from '../services/userService';
import { registerSchema, loginSchema, RegisterInput, LoginInput } from '../utils/validation';
import { AuthenticatedRequest } from '../utils/jwt';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const validatedData: RegisterInput = registerSchema.parse(req.body);

    // Create user
    const userData = {
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.name,
      ...(validatedData.location && { location: validatedData.location }),
      ...(validatedData.timezone && { timezone: validatedData.timezone }),
      ...(validatedData.dinnerTimePreference && { dinnerTimePreference: validatedData.dinnerTimePreference }),
      ...(validatedData.spiceTolerance && { spiceTolerance: validatedData.spiceTolerance }),
    };
    
    const user = await createUser(userData);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
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
      if (error.message === 'User with this email already exists') {
        res.status(409).json({
          success: false,
          error: error.message,
        });
        return;
      }
    }

    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const validatedData: LoginInput = loginSchema.parse(req.body);

    // Authenticate user
    const user = await authenticateUser(validatedData);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
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
      if (error.message === 'Invalid email or password') {
        res.status(401).json({
          success: false,
          error: error.message,
        });
        return;
      }
    }

    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Logout user (client-side token removal)
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  // JWT tokens are stateless, so logout is handled client-side
  // by removing the token from localStorage
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};

/**
 * Check email availability
 */
export const checkEmailAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email is required',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
      return;
    }

    const available = await isEmailAvailable(email);

    res.status(200).json({
      success: true,
      data: {
        available,
        email,
      },
    });
  } catch (error) {
    console.error('Check email availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const user = await getUserById(req.user.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}; 