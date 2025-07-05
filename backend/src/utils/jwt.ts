import jwt from 'jsonwebtoken';
import { Request } from 'express';

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

/**
 * Generate JWT token for user
 */
export const generateToken = (payload: JWTPayload): string => {
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  // 7 days in seconds
  return jwt.sign(payload, secret, {
    expiresIn: 60 * 60 * 24 * 7,
  });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // Remove 'Bearer ' prefix
}; 