import jwt from 'jsonwebtoken';

export interface PasswordResetPayload {
  userId: string;
  email: string;
  type: 'password_reset';
  issuedAt: number;
}

/**
 * Password Reset JWT Utilities
 * Completely isolated from existing auth system
 */
export class PasswordResetJWT {
  private static readonly SECRET_KEY = process.env['JWT_SECRET'] || 'your-secret-key';
  private static readonly EXPIRY_TIME = '1h'; // 1 hour expiry for security

  /**
   * Generate a password reset token
   */
  static generateResetToken(userId: string, email: string): string {
    const payload: PasswordResetPayload = {
      userId,
      email,
      type: 'password_reset',
      issuedAt: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, this.SECRET_KEY, {
      expiresIn: this.EXPIRY_TIME,
      issuer: 'restaurant-recipe-finder',
      subject: 'password-reset',
    });
  }

  /**
   * Verify and decode a password reset token
   */
  static verifyResetToken(token: string): PasswordResetPayload | null {
    try {
      const decoded = jwt.verify(token, this.SECRET_KEY, {
        issuer: 'restaurant-recipe-finder',
        subject: 'password-reset',
      }) as PasswordResetPayload;

      // Additional validation - ensure it's a password reset token
      if (decoded.type !== 'password_reset') {
        console.error('Invalid token type for password reset');
        return null;
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.error('Password reset token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.error('Invalid password reset token');
      } else {
        console.error('Password reset token verification failed:', error);
      }
      return null;
    }
  }

  /**
   * Check if a token is expired (for better error messages)
   */
  static isTokenExpired(token: string): boolean {
    try {
      jwt.verify(token, this.SECRET_KEY);
      return false;
    } catch (error) {
      return error instanceof jwt.TokenExpiredError;
    }
  }

  /**
   * Get token expiry time in seconds
   */
  static getTokenExpiryTime(): number {
    return 3600; // 1 hour in seconds
  }

  /**
   * Validate token format without verifying signature (for basic checks)
   */
  static isValidTokenFormat(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as PasswordResetPayload;
      return decoded && decoded.type === 'password_reset';
    } catch {
      return false;
    }
  }
} 