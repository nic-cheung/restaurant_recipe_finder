"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/register', authController_1.register);
router.post('/check-email', authController_1.checkEmailAvailability);
router.post('/login', authController_1.login);
router.post('/logout', auth_1.authenticateToken, authController_1.logout);
router.get('/me', auth_1.authenticateToken, authController_1.getCurrentUser);
router.get('/test-credentials', (_req, res) => {
    if (process.env['NODE_ENV'] !== 'development') {
        return res.status(404).json({
            success: false,
            error: 'Not found'
        });
    }
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const testCredentials = {
        email: `test.${timestamp}.${randomNum}@test.local`,
        password: 'TestPass123!',
        name: `Test User ${timestamp.toString().slice(-4)}`
    };
    return res.json({
        success: true,
        data: testCredentials
    });
});
router.put('/password', auth_1.authenticateToken, authController_1.updatePassword);
exports.default = router;
//# sourceMappingURL=auth.js.map