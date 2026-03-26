const Student = require('../models/Student');

exports.getStudents = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const { search, course, year } = req.query;

    const filter = { collegeId, isActive: true };
    if (course) filter.course = course;
    if (year) filter.year = Number(year);
    if (search) filter.name = { $regex: search, $options: 'i' };

    const students = await Student.find(filter).sort({ name: 1 });
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      collegeId: req.user.collegeId,
      isActive: true,
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create({
      ...req.body,
      collegeId: req.user.collegeId,
    });
    res.status(201).json(student);
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, collegeId: req.user.collegeId },
      req.body,
      { returnDocument: 'after', runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, collegeId: req.user.collegeId },
      { isActive: false },
      { returnDocument: 'after' }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};