"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const authenticateToken = async (req, _res, next) => {
    try {
        const token = (0, jwt_1.extractTokenFromHeader)(req);
        if (!token) {
            _res.status(401).json({
                success: false,
                error: 'Access token required',
            });
            return;
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        _res.status(401).json({
            success: false,
            error: 'Invalid or expired token',
        });
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, _res, next) => {
    try {
        const token = (0, jwt_1.extractTokenFromHeader)(req);
        if (token) {
            const decoded = (0, jwt_1.verifyToken)(token);
            req.user = decoded;
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map