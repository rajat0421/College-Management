const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

router.use(protect);

router.get('/stats', dashboardController.getStats);

module.exports = router;
