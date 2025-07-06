import { Request } from 'express';
export interface JWTPayload {
    userId: string;
    email: string;
}
export interface AuthenticatedRequest extends Request {
    user?: JWTPayload;
}
export declare const generateToken: (payload: JWTPayload) => string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const extractTokenFromHeader: (req: Request) => string | null;
//# sourceMappingURL=jwt.d.ts.map