const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { validate, attendanceSchema } = require('../validation/schemas');
const attendanceController = require('../controllers/attendance.controller');
const smartController = require('../controllers/smart.controller');

router.use(protect);

router.post('/mark', validate(attendanceSchema), attendanceController.markAttendance);
router.get('/', attendanceController.getAttendance);
router.get('/report', attendanceController.getAttendanceReport);
router.get('/smart-report', smartController.getSmartReport);

module.exports = router;
