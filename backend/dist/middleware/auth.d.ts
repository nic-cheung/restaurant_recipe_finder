import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../utils/jwt';
export declare const authenticateToken: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map