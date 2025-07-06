"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const preferencesController_1 = require("../controllers/preferencesController");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, preferencesController_1.getPreferences);
router.put('/', auth_1.authenticateToken, preferencesController_1.updatePreferences);
router.patch('/', auth_1.authenticateToken, preferencesController_1.patchPreferences);
router.delete('/', auth_1.authenticateToken, preferencesController_1.deletePreferences);
router.get('/summary', auth_1.authenticateToken, preferencesController_1.getPreferencesSummary);
router.get('/options', auth_1.authenticateToken, preferencesController_1.getPreferencesOptions);
router.get('/suggestions/chefs', auth_1.authenticateToken, preferencesController_1.getChefSuggestions);
router.get('/suggestions/restaurants', auth_1.authenticateToken, preferencesController_1.getRestaurantSuggestions);
router.get('/suggestions/ingredients', auth_1.authenticateToken, preferencesController_1.getIngredientSuggestions);
router.get('/suggestions/cuisines', auth_1.authenticateToken, preferencesController_1.getCuisineSuggestions);
router.get('/suggestions/dishes', auth_1.authenticateToken, preferencesController_1.getDishSuggestions);
router.get('/suggestions/nutritional-goals', auth_1.authenticateToken, (_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Nutritional goals suggestions not implemented - use /api/preferences/options instead'
    });
});
router.get('/suggestions/equipment', auth_1.authenticateToken, (_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Equipment suggestions not implemented - use /api/preferences/options instead'
    });
});
router.get('/suggestions/meal-types', auth_1.authenticateToken, (_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Meal types suggestions not implemented - use /api/preferences/options instead'
    });
});
exports.default = router;
//# sourceMappingURL=preferences.js.map