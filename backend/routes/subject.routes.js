const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { validate, subjectSchema, subjectUpdateSchema } = require('../validation/schemas');
const subjectController = require('../controllers/subject.controller');

router.use(protect);

router.get('/by-branch', subjectController.list);
router.get('/all', adminOnly, subjectController.listAll);
router.post('/', adminOnly, validate(subjectSchema), subjectController.create);
router.put('/:id', adminOnly, validate(subjectUpdateSchema), subjectController.update);
router.delete('/:id', adminOnly, subjectController.remove);

module.exports = router;
