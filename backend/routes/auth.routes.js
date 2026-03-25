const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { validate, loginSchema, changePasswordSchema } = require('../validation/schemas');
const authController = require('../controllers/auth.controller');

router.post('/login', validate(loginSchema), authController.login);
router.get('/profile', protect, authController.getProfile);
router.put('/change-password', protect, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
