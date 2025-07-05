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
 * User preferences validation schema
 */
export const userPreferencesSchema = z.object({
  dietaryRestrictions: z
    .array(z.string().min(1, 'Dietary restriction cannot be empty'))
    .max(20, 'Too many dietary restrictions')
    .optional()
    .default([]),
  allergies: z
    .array(z.string().min(1, 'Allergy cannot be empty'))
    .max(50, 'Too many allergies')
    .optional()
    .default([]),
  favoriteIngredients: z
    .array(z.string().min(1, 'Ingredient cannot be empty'))
    .max(100, 'Too many favorite ingredients')
    .optional()
    .default([]),
  dislikedFoods: z
    .array(z.string().min(1, 'Disliked food cannot be empty'))
    .max(100, 'Too many disliked foods')
    .optional()
    .default([]),
  favoriteCuisines: z
    .array(z.string().min(1, 'Cuisine cannot be empty'))
    .max(30, 'Too many favorite cuisines')
    .optional()
    .default([]),
  cookingSkillLevel: z
    .enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
    .optional()
    .default('BEGINNER'),
  preferredCookingTime: z
    .number()
    .int('Cooking time must be an integer')
    .min(5, 'Cooking time must be at least 5 minutes')
    .max(480, 'Cooking time cannot exceed 8 hours')
    .nullable()
    .optional(),
  servingSize: z
    .number()
    .int('Serving size must be an integer')
    .min(1, 'Serving size must be at least 1')
    .max(20, 'Serving size cannot exceed 20')
    .nullable()
    .optional()
    .default(2),
});

/**
 * Partial user preferences schema for updates
 */
export const updateUserPreferencesSchema = userPreferencesSchema.partial();

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
export type UpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesSchema>;

// Common dietary restrictions for validation
export const COMMON_DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
  'Low-Fat',
  'Low-Sodium',
  'Diabetic-Friendly',
  'Heart-Healthy',
  'Mediterranean',
  'Whole30',
  'Pescatarian',
  'Kosher',
  'Halal',
] as const;

// Common allergies for validation
export const COMMON_ALLERGIES = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Soy',
  'Wheat',
  'Sesame',
  'Mustard',
  'Celery',
  'Lupin',
  'Mollusks',
  'Sulfites',
] as const;

// Common cuisines for validation
export const COMMON_CUISINES = [
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Indian',
  'Thai',
  'French',
  'Greek',
  'Mediterranean',
  'American',
  'Korean',
  'Vietnamese',
  'Spanish',
  'Turkish',
  'Lebanese',
  'Moroccan',
  'Ethiopian',
  'Brazilian',
  'Peruvian',
  'British',
  'German',
  'Russian',
  'Caribbean',
  'Middle Eastern',
  'African',
] as const; 