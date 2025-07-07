export declare class GoogleAuthService {
    private auth;
    private accessToken;
    private tokenExpiry;
    constructor();
    private initializeAuth;
    getAccessToken(): Promise<string>;
    isConfigured(): boolean;
    makeAuthenticatedRequest(url: string, options?: any): Promise<Response>;
}
export declare const googleAuthService: GoogleAuthService;
//# sourceMappingURL=googleAuthService.d.ts.map