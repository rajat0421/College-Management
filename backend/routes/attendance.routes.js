const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { validate, attendanceSchema } = require('../validation/schemas');
const attendanceController = require('../controllers/attendance.controller');

router.use(protect);

router.post('/mark', validate(attendanceSchema), attendanceController.markAttendance);
router.get('/', attendanceController.getAttendance);
router.get('/report', attendanceController.getAttendanceReport);

module.exports = router;
