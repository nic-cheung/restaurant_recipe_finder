import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../utils/jwt';
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const logout: (_req: Request, res: Response) => Promise<void>;
export declare const checkEmailAvailability: (req: Request, res: Response) => Promise<void>;
export declare const getCurrentUser: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updatePassword: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map