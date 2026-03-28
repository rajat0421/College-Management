const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const studentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  rollNumber: Joi.string().trim().allow(''),
  branchId: Joi.string().required(),
  year: Joi.number().integer().min(1).max(6).required(),
  email: Joi.string().email().allow('').trim(),
});

const teacherCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const teacherUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.alternatives().try(Joi.string().min(6), Joi.valid('', null)).optional(),
});

const attendanceSchema = Joi.object({
  date: Joi.date().required(),
  branchId: Joi.string().required(),
  subjectId: Joi.string().required(),
  year: Joi.number().integer().min(1).max(6).required(),
  records: Joi.array()
    .items(
      Joi.object({
        studentId: Joi.string().required(),
        status: Joi.string().valid('present', 'absent').required(),
      })
    )
    .min(1)
    .required(),
});

const branchSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
});

const subjectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  branchId: Joi.string().required(),
  years: Joi.array().items(Joi.number().integer().min(1).max(6)).default([]),
});

const subjectUpdateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100),
  branchId: Joi.string(),
  years: Joi.array().items(Joi.number().integer().min(1).max(6)),
})
  .min(1)
  .messages({
    'object.min': 'At least one field is required',
  });

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message);
    return res.status(400).json({ message: 'Validation error', errors: messages });
  }
  next();
};

module.exports = {
  loginSchema,
  studentSchema,
  teacherCreateSchema,
  teacherUpdateSchema,
  attendanceSchema,
  branchSchema,
  subjectSchema,
  subjectUpdateSchema,
  changePasswordSchema,
  validate,
};
