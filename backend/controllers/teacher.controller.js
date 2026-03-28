const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { sendTeacherWelcomeEmail } = require('../services/email.service');

exports.getTeachers = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const { search } = req.query;

    const filter = { collegeId };
    if (search) {
      const userIdsByEmail = await User.find({
        collegeId,
        role: 'teacher',
        email: { $regex: search, $options: 'i' },
      }).distinct('_id');
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        ...(userIdsByEmail.length ? [{ userId: { $in: userIdsByEmail } }] : []),
      ];
    }

    const teachers = await Teacher.find(filter).populate('userId', 'email').sort({ name: 1 });
    const result = teachers.map((t) => {
      const o = t.toObject();
      o.email = o.userId?.email || null;
      return o;
    });
    res.json(result);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({
      _id: req.params.id,
      collegeId: req.user.collegeId,
    }).populate('userId', 'email');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const o = teacher.toObject();
    o.email = o.userId?.email || null;
    res.json(o);
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createTeacher = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email, collegeId });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'teacher',
      collegeId,
    });

    const teacher = await Teacher.create({
      name,
      collegeId,
      userId: user._id,
    });

    try {
      await sendTeacherWelcomeEmail(email, name, email, password);
    } catch (mailErr) {
      console.error('Welcome email failed:', mailErr.message);
    }

    const populated = await Teacher.findById(teacher._id).populate('userId', 'email');
    const o = populated.toObject();
    o.email = o.userId?.email;
    res.status(201).json(o);
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const { name, email, password } = req.body;

    const teacher = await Teacher.findOne({
      _id: req.params.id,
      collegeId,
    });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    teacher.name = name;
    await teacher.save();

    if (teacher.userId) {
      const user = await User.findById(teacher.userId);
      if (user) {
        user.name = name;
        if (email && email !== user.email) {
          const taken = await User.findOne({ email, collegeId, _id: { $ne: user._id } });
          if (taken) {
            return res.status(400).json({ message: 'Email already in use' });
          }
          user.email = email;
        }
        if (password && password.length >= 6) {
          user.password = password;
        }
        await user.save();
      }
    }

    const populated = await Teacher.findById(teacher._id).populate('userId', 'email');
    const o = populated.toObject();
    o.email = o.userId?.email;
    res.json(o);
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({
      _id: req.params.id,
      collegeId: req.user.collegeId,
    });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (teacher.userId) {
      await User.findByIdAndDelete(teacher.userId);
    }

    await Teacher.findByIdAndDelete(teacher._id);

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
