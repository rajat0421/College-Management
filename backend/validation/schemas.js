const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const studentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  rollNumber: Joi.string().trim().allow(''),
  course: Joi.string().trim().required(),
  year: Joi.number().integer().min(1).max(6).required(),
  parentEmail: Joi.string().email().allow('').trim(),
});

const teacherSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  subject: Joi.string().trim().required(),
});

const attendanceSchema = Joi.object({
  date: Joi.date().required(),
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
  teacherSchema,
  attendanceSchema,
  changePasswordSchema,
  validate,
};
