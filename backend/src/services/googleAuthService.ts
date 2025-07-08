import { google } from 'googleapis';
import path from 'path';

export class GoogleAuthService {
  private auth: any;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    try {
      // Scopes for Google Places API and Gemini API
      const scopes = [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/generative-language.retriever'
      ];

      // Option 1: Use service account key file
      if (process.env['GOOGLE_SERVICE_ACCOUNT_KEY_PATH']) {
        const keyFile = path.resolve(process.env['GOOGLE_SERVICE_ACCOUNT_KEY_PATH']);
        this.auth = new google.auth.GoogleAuth({
          keyFile,
          scopes
        });
      }
      // Option 2: Use service account key as environment variable
      else if (process.env['GOOGLE_SERVICE_ACCOUNT_KEY']) {
        const serviceAccountKey = JSON.parse(process.env['GOOGLE_SERVICE_ACCOUNT_KEY']);
        this.auth = new google.auth.GoogleAuth({
          credentials: serviceAccountKey,
          scopes
        });
      }
      // Option 3: Use OAuth client credentials
      else if (process.env['GOOGLE_CLIENT_ID'] && process.env['GOOGLE_CLIENT_SECRET']) {
        this.auth = new google.auth.OAuth2(
          process.env['GOOGLE_CLIENT_ID'],
          process.env['GOOGLE_CLIENT_SECRET'],
          'urn:ietf:wg:oauth:2.0:oob' // For server-side apps
        );
      }
    } catch (error) {
      console.log('Google Auth initialization failed:', error);
    }
  }

  /**
   * Get a valid access token for Google APIs (Places API and Gemini API)
   */
  async getAccessToken(): Promise<string> {
    try {
      // Check if current token is still valid
      if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.accessToken as string;
      }

      // Get new token
      if (this.auth) {
        const authClient = await this.auth.getClient();
        const accessTokenResponse = await authClient.getAccessToken();
        
        if (accessTokenResponse.token) {
          this.accessToken = accessTokenResponse.token;
          // Set expiry to 55 minutes from now (tokens usually last 1 hour)
          this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);
          return this.accessToken as string;
        }
      }

      throw new Error('Failed to get access token');
    } catch (error) {
      console.error('Error getting Google access token:', error);
      throw error;
    }
  }

  /**
   * Check if OAuth is properly configured
   */
  isConfigured(): boolean {
    return !!(
      process.env['GOOGLE_SERVICE_ACCOUNT_KEY_PATH'] ||
      process.env['GOOGLE_SERVICE_ACCOUNT_KEY'] ||
      (process.env['GOOGLE_CLIENT_ID'] && process.env['GOOGLE_CLIENT_SECRET'])
    );
  }

  /**
   * Make an authenticated request to Google APIs (Places API, Gemini API, etc.)
   */
  async makeAuthenticatedRequest(url: string, options: any = {}): Promise<Response> {
    const accessToken = await this.getAccessToken();
    
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }
}

export const googleAuthService = new GoogleAuthService(); 