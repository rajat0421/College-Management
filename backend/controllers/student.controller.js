const Student = require('../models/Student');
const Branch = require('../models/Branch');

exports.getStudents = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const { search, branchId, year } = req.query;

    const filter = { collegeId, isActive: true };
    if (branchId) filter.branchId = branchId;
    if (year) filter.year = Number(year);
    if (search) filter.name = { $regex: search, $options: 'i' };

    const students = await Student.find(filter).populate('branchId', 'name').sort({ name: 1 });
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
    }).populate('branchId', 'name');

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
    const { collegeId } = req.user;
    const { branchId } = req.body;

    const branch = await Branch.findOne({ _id: branchId, collegeId });
    if (!branch) {
      return res.status(400).json({ message: 'Invalid branch' });
    }

    const student = await Student.create({
      ...req.body,
      collegeId,
    });
    await student.populate('branchId', 'name');
    res.status(201).json(student);
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const { branchId } = req.body;

    if (branchId) {
      const branch = await Branch.findOne({ _id: branchId, collegeId });
      if (!branch) {
        return res.status(400).json({ message: 'Invalid branch' });
      }
    }

    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, collegeId },
      req.body,
      { returnDocument: 'after', runValidators: true }
    ).populate('branchId', 'name');

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
