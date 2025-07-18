"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recipeController_1 = require("../controllers/recipeController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.post('/generate', recipeController_1.recipeController.generateRecipe);
router.post('/save', recipeController_1.recipeController.saveRecipe);
router.post('/generate-and-save', recipeController_1.recipeController.generateAndSaveRecipe);
router.get('/my-recipes', recipeController_1.recipeController.getUserRecipes);
router.get('/favorites', recipeController_1.recipeController.getFavoriteRecipes);
router.get('/search', recipeController_1.recipeController.searchRecipes);
router.get('/:recipeId', recipeController_1.recipeController.getRecipe);
router.post('/:recipeId/rate', recipeController_1.recipeController.rateRecipe);
router.post('/:recipeId/favorite', recipeController_1.recipeController.addToFavorites);
router.delete('/:recipeId/favorite', recipeController_1.recipeController.removeFromFavorites);
router.post('/:recipeId/variation', recipeController_1.recipeController.generateVariation);
exports.default = router;
//# sourceMappingURL=recipes.js.map