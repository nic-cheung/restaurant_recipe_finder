export interface CreateUserData {
    email: string;
    password: string;
    name: string;
    location?: string;
    timezone?: string;
    dinnerTimePreference?: string;
    spiceTolerance?: 'MILD' | 'MEDIUM' | 'HOT' | 'EXTREME';
}
export interface LoginData {
    email: string;
    password: string;
}
export interface UserWithoutPassword {
    id: string;
    email: string;
    name: string;
    location: string | null;
    timezone: string | null;
    dinnerTimePreference: string | null;
    spiceTolerance: 'MILD' | 'MEDIUM' | 'HOT' | 'EXTREME';
    createdAt: Date;
    updatedAt: Date;
}
export declare const createUser: (userData: CreateUserData) => Promise<UserWithoutPassword>;
export declare const authenticateUser: (loginData: LoginData) => Promise<UserWithoutPassword>;
export declare const getUserById: (userId: string) => Promise<UserWithoutPassword | null>;
export declare const getUserByEmail: (email: string) => Promise<UserWithoutPassword | null>;
export declare const isEmailAvailable: (email: string) => Promise<boolean>;
export declare const updateUser: (userId: string, updateData: Partial<Omit<CreateUserData, "password">>) => Promise<UserWithoutPassword>;
export declare const updateUserPassword: (userId: string, currentPassword: string, newPassword: string) => Promise<void>;
//# sourceMappingURL=userService.d.ts.map