import { z } from 'zod';

/**
 * User registration validation schema
 */
export const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  location: z
    .string()
    .optional(),
  timezone: z
    .string()
    .optional(),
  dinnerTimePreference: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Dinner time must be in HH:MM format')
    .optional(),
  spiceTolerance: z
    .enum(['MILD', 'MEDIUM', 'HOT', 'EXTREME'])
    .optional(),
});

/**
 * User login validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

/**
 * User profile update validation schema
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  location: z
    .string()
    .optional(),
  timezone: z
    .string()
    .optional(),
  dinnerTimePreference: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Dinner time must be in HH:MM format')
    .optional(),
  spiceTolerance: z
    .enum(['MILD', 'MEDIUM', 'HOT', 'EXTREME'])
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>; 