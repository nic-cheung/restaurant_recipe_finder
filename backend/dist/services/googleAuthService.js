"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthService = exports.GoogleAuthService = void 0;
const googleapis_1 = require("googleapis");
const path_1 = __importDefault(require("path"));
class GoogleAuthService {
    constructor() {
        this.accessToken = null;
        this.tokenExpiry = null;
        this.initializeAuth();
    }
    initializeAuth() {
        try {
            if (process.env['GOOGLE_SERVICE_ACCOUNT_KEY_PATH']) {
                const keyFile = path_1.default.resolve(process.env['GOOGLE_SERVICE_ACCOUNT_KEY_PATH']);
                this.auth = new googleapis_1.google.auth.GoogleAuth({
                    keyFile,
                    scopes: ['https://www.googleapis.com/auth/cloud-platform']
                });
            }
            else if (process.env['GOOGLE_SERVICE_ACCOUNT_KEY']) {
                const serviceAccountKey = JSON.parse(process.env['GOOGLE_SERVICE_ACCOUNT_KEY']);
                this.auth = new googleapis_1.google.auth.GoogleAuth({
                    credentials: serviceAccountKey,
                    scopes: ['https://www.googleapis.com/auth/cloud-platform']
                });
            }
            else if (process.env['GOOGLE_CLIENT_ID'] && process.env['GOOGLE_CLIENT_SECRET']) {
                this.auth = new googleapis_1.google.auth.OAuth2(process.env['GOOGLE_CLIENT_ID'], process.env['GOOGLE_CLIENT_SECRET'], 'urn:ietf:wg:oauth:2.0:oob');
            }
        }
        catch (error) {
            console.log('Google Auth initialization failed:', error);
        }
    }
    async getAccessToken() {
        try {
            if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
                return this.accessToken;
            }
            if (this.auth) {
                const authClient = await this.auth.getClient();
                const accessTokenResponse = await authClient.getAccessToken();
                if (accessTokenResponse.token) {
                    this.accessToken = accessTokenResponse.token;
                    this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);
                    return this.accessToken;
                }
            }
            throw new Error('Failed to get access token');
        }
        catch (error) {
            console.error('Error getting Google access token:', error);
            throw error;
        }
    }
    isConfigured() {
        return !!(process.env['GOOGLE_SERVICE_ACCOUNT_KEY_PATH'] ||
            process.env['GOOGLE_SERVICE_ACCOUNT_KEY'] ||
            (process.env['GOOGLE_CLIENT_ID'] && process.env['GOOGLE_CLIENT_SECRET']));
    }
    async makeAuthenticatedRequest(url, options = {}) {
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
exports.GoogleAuthService = GoogleAuthService;
exports.googleAuthService = new GoogleAuthService();
//# sourceMappingURL=googleAuthService.js.map