"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.getCurrentUser = exports.checkEmailAvailability = exports.logout = exports.login = exports.register = void 0;
const zod_1 = require("zod");
const jwt_1 = require("../utils/jwt");
const userService_1 = require("../services/userService");
const validation_1 = require("../utils/validation");
const register = async (req, res) => {
    try {
        const validatedData = validation_1.registerSchema.parse(req.body);
        const userData = {
            email: validatedData.email,
            password: validatedData.password,
            name: validatedData.name,
            ...(validatedData.location && { location: validatedData.location }),
            ...(validatedData.timezone && { timezone: validatedData.timezone }),
            ...(validatedData.dinnerTimePreference && { dinnerTimePreference: validatedData.dinnerTimePreference }),
            ...(validatedData.spiceTolerance && { spiceTolerance: validatedData.spiceTolerance }),
        };
        const user = await (0, userService_1.createUser)(userData);
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
        });
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user,
                token,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
            return;
        }
        if (error instanceof Error) {
            if (error.message === 'User with this email already exists') {
                res.status(409).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
        }
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const validatedData = validation_1.loginSchema.parse(req.body);
        const user = await (0, userService_1.authenticateUser)(validatedData);
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
        });
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                token,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
            return;
        }
        if (error instanceof Error) {
            if (error.message === 'Invalid email or password') {
                res.status(401).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
        }
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.login = login;
const logout = async (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logout successful',
    });
};
exports.logout = logout;
const checkEmailAvailability = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                error: 'Email is required',
            });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                error: 'Invalid email format',
            });
            return;
        }
        const available = await (0, userService_1.isEmailAvailable)(email);
        res.status(200).json({
            success: true,
            data: {
                available,
                email,
            },
        });
    }
    catch (error) {
        console.error('Check email availability error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.checkEmailAvailability = checkEmailAvailability;
const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }
        const user = await (0, userService_1.getUserById)(req.user.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                user,
            },
        });
    }
    catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.getCurrentUser = getCurrentUser;
const updatePassword = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }
        const validatedData = validation_1.updatePasswordSchema.parse(req.body);
        await (0, userService_1.updateUserPassword)(req.user.userId, validatedData.currentPassword, validatedData.newPassword);
        res.status(200).json({
            success: true,
            message: 'Password updated successfully',
        });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
            return;
        }
        if (error instanceof Error) {
            if (error.message === 'Current password is incorrect') {
                res.status(400).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
            if (error.message === 'User not found') {
                res.status(404).json({
                    success: false,
                    error: error.message,
                });
                return;
            }
        }
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};
exports.updatePassword = updatePassword;
//# sourceMappingURL=authController.js.map