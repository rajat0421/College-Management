const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { validate, studentSchema } = require('../validation/schemas');
const studentController = require('../controllers/student.controller');

router.use(protect);

router.get('/', studentController.getStudents);
router.get('/:id', studentController.getStudent);
router.post('/', adminOnly, validate(studentSchema), studentController.createStudent);
router.put('/:id', adminOnly, validate(studentSchema), studentController.updateStudent);
router.delete('/:id', adminOnly, studentController.deleteStudent);

module.exports = router;
