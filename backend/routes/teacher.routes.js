const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { validate, teacherSchema } = require('../validation/schemas');
const teacherController = require('../controllers/teacher.controller');

router.use(protect);

router.get('/', teacherController.getTeachers);
router.get('/:id', teacherController.getTeacher);
router.post('/', adminOnly, validate(teacherSchema), teacherController.createTeacher);
router.put('/:id', adminOnly, validate(teacherSchema), teacherController.updateTeacher);
router.delete('/:id', adminOnly, teacherController.deleteTeacher);

module.exports = router;
