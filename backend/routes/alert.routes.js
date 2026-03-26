const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const alertController = require('../controllers/alert.controller');

router.use(protect);

router.post('/send', alertController.sendAlert);
router.post('/send-bulk', alertController.sendBulkAlerts);
router.get('/log', alertController.getAlertLog);

module.exports = router;
