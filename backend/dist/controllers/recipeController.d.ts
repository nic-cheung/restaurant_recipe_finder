import { Response } from 'express';
import { AuthenticatedRequest } from '../utils/jwt';
export declare class RecipeController {
    generateRecipe(req: AuthenticatedRequest, res: Response): Promise<void>;
    saveRecipe(req: AuthenticatedRequest, res: Response): Promise<void>;
    getUserRecipes(req: AuthenticatedRequest, res: Response): Promise<void>;
    getRecipe(req: AuthenticatedRequest, res: Response): Promise<void>;
    rateRecipe(req: AuthenticatedRequest, res: Response): Promise<void>;
    addToFavorites(req: AuthenticatedRequest, res: Response): Promise<void>;
    removeFromFavorites(req: AuthenticatedRequest, res: Response): Promise<void>;
    getFavoriteRecipes(req: AuthenticatedRequest, res: Response): Promise<void>;
    generateVariation(req: AuthenticatedRequest, res: Response): Promise<void>;
    generateAndSaveRecipe(req: AuthenticatedRequest, res: Response): Promise<void>;
    searchRecipes(_req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const recipeController: RecipeController;
//# sourceMappingURL=recipeController.d.ts.map