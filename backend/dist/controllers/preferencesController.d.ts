import { Response } from 'express';
import { AuthenticatedRequest } from '../utils/jwt';
export declare const getPreferences: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updatePreferences: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const patchPreferences: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deletePreferences: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getPreferencesSummary: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getPreferencesOptions: (_req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getRestaurantSuggestions: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getChefSuggestions: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getIngredientSuggestions: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getCuisineSuggestions: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getDishSuggestions: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=preferencesController.d.ts.map