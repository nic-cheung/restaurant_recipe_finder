"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.isEmailAvailable = exports.getUserByEmail = exports.getUserById = exports.authenticateUser = exports.createUser = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const createUser = async (userData) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
    });
    if (existingUser) {
        throw new Error('User with this email already exists');
    }
    const saltRounds = 12;
    const passwordHash = await bcryptjs_1.default.hash(userData.password, saltRounds);
    const user = await prisma.user.create({
        data: {
            email: userData.email,
            passwordHash,
            name: userData.name,
            location: userData.location || null,
            timezone: userData.timezone || 'UTC',
            dinnerTimePreference: userData.dinnerTimePreference || '19:00',
            spiceTolerance: userData.spiceTolerance || 'MEDIUM',
        },
    });
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
exports.createUser = createUser;
const authenticateUser = async (loginData) => {
    const user = await prisma.user.findUnique({
        where: { email: loginData.email },
    });
    if (!user) {
        throw new Error('Invalid email or password');
    }
    const isPasswordValid = await bcryptjs_1.default.compare(loginData.password, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
exports.authenticateUser = authenticateUser;
const getUserById = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        return null;
    }
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
exports.getUserById = getUserById;
const getUserByEmail = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        return null;
    }
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
exports.getUserByEmail = getUserByEmail;
const isEmailAvailable = async (email) => {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });
    return !existingUser;
};
exports.isEmailAvailable = isEmailAvailable;
const updateUser = async (userId, updateData) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
    });
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
exports.updateUser = updateUser;
//# sourceMappingURL=userService.js.map