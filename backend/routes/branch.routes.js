const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { validate, branchSchema } = require('../validation/schemas');
const branchController = require('../controllers/branch.controller');

router.use(protect);

router.get('/', branchController.list);
router.post('/', adminOnly, validate(branchSchema), branchController.create);
router.put('/:id', adminOnly, validate(branchSchema), branchController.update);
router.delete('/:id', adminOnly, branchController.remove);

module.exports = router;
