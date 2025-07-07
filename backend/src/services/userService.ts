import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  location?: string;
  timezone?: string;
  dinnerTimePreference?: string;
  spiceTolerance?: 'MILD' | 'MEDIUM' | 'HOT' | 'EXTREME';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserWithoutPassword {
  id: string;
  email: string;
  name: string;
  location: string | null;
  timezone: string | null;
  dinnerTimePreference: string | null;
  spiceTolerance: 'MILD' | 'MEDIUM' | 'HOT' | 'EXTREME';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new user
 */
export const createUser = async (userData: CreateUserData): Promise<UserWithoutPassword> => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(userData.password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: userData.email,
      passwordHash,
      name: userData.name,
      location: userData.location || null,
      timezone: userData.timezone || 'UTC',
      dinnerTimePreference: userData.dinnerTimePreference || '19:00',
      spiceTolerance: userData.spiceTolerance || 'MEDIUM',
    },
  });

  // Return user without password
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Authenticate user login
 */
export const authenticateUser = async (loginData: LoginData): Promise<UserWithoutPassword> => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: loginData.email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(loginData.password, user.passwordHash);
  
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Return user without password
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<UserWithoutPassword | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  // Return user without password
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<UserWithoutPassword | null> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  // Return user without password
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Check if email is available for registration
 */
export const isEmailAvailable = async (email: string): Promise<boolean> => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  return !existingUser;
};

/**
 * Update user profile
 */
export const updateUser = async (
  userId: string,
  updateData: Partial<Omit<CreateUserData, 'password'>>
): Promise<UserWithoutPassword> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  // Return user without password
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Update user password
 */
export const updateUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  // Find user by ID
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
  
  if (!isCurrentPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const saltRounds = 12;
  const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

  // Update password in database
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });
}; 