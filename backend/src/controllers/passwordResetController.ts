import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { emailService } from '../services/emailService';
import { PasswordResetJWT } from '../utils/passwordResetJWT';
import { getUserByEmail } from '../services/userService';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validation schemas
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
});

const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

/**
 * Handle forgot password request
 * Sends password reset email if user exists
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const { email } = forgotPasswordSchema.parse(req.body);

    // Check if user exists
    const user = await getUserByEmail(email);
    
    if (!user) {
      // For security, always return success even if user doesn't exist
      // This prevents email enumeration attacks
      res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
      });
      return;
    }

    // Generate reset token
    const resetToken = PasswordResetJWT.generateResetToken(user.id, user.email);

    // Send reset email
    const emailSent = await emailService.sendPasswordResetEmail(user.email, resetToken);

    if (!emailSent) {
      console.error('Failed to send password reset email for user:', user.email);
      res.status(500).json({
        success: false,
        error: 'Failed to send password reset email. Please try again later.',
      });
      return;
    }

    console.log('Password reset email sent successfully for user:', user.email);
    
    res.status(200).json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
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

    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Handle password reset with token
 * Validates token and updates user password
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const { token, newPassword } = resetPasswordSchema.parse(req.body);

    // Verify reset token
    const payload = PasswordResetJWT.verifyResetToken(token);
    
    if (!payload) {
      // Check if token is expired for better error message
      if (PasswordResetJWT.isTokenExpired(token)) {
        res.status(400).json({
          success: false,
          error: 'Password reset link has expired. Please request a new one.',
        });
        return;
      }
      
      res.status(400).json({
        success: false,
        error: 'Invalid or expired password reset token.',
      });
      return;
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found.',
      });
      return;
    }

    // Verify email matches (additional security check)
    if (user.email !== payload.email) {
      res.status(400).json({
        success: false,
        error: 'Invalid password reset token.',
      });
      return;
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password directly in database (isolated from existing updateUserPassword)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    console.log('Password reset successful for user:', user.email);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
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

    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Validate password reset token
 * Checks if token is valid without performing reset
 */
export const validateResetToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Reset token is required',
      });
      return;
    }

    // Verify reset token
    const payload = PasswordResetJWT.verifyResetToken(token);
    
    if (!payload) {
      // Check if token is expired for better error message
      if (PasswordResetJWT.isTokenExpired(token)) {
        res.status(400).json({
          success: false,
          error: 'Password reset link has expired. Please request a new one.',
          expired: true,
        });
        return;
      }
      
      res.status(400).json({
        success: false,
        error: 'Invalid password reset token.',
        expired: false,
      });
      return;
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found.',
      });
      return;
    }

    // Verify email matches
    if (user.email !== payload.email) {
      res.status(400).json({
        success: false,
        error: 'Invalid password reset token.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Reset token is valid',
      data: {
        email: user.email,
        expiresIn: PasswordResetJWT.getTokenExpiryTime(),
      },
    });
  } catch (error) {
    console.error('Validate reset token error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}; 