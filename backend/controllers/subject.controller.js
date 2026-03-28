const Subject = require('../models/Subject');
const Branch = require('../models/Branch');

function subjectAppliesToYear(subject, yearNum) {
  if (!yearNum) return true;
  const y = Number(yearNum);
  if (!subject.years || subject.years.length === 0) return true;
  return subject.years.includes(y);
}

exports.list = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const { branchId, year } = req.query;

    if (!branchId) {
      return res.status(400).json({ message: 'branchId query is required' });
    }

    const branch = await Branch.findOne({ _id: branchId, collegeId });
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    const subjects = await Subject.find({ branchId, collegeId }).sort({ name: 1 });
    const filtered = year
      ? subjects.filter((s) => subjectAppliesToYear(s, year))
      : subjects;

    res.json(filtered);
  } catch (error) {
    console.error('List subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listAll = async (req, res) => {
  try {
    const subjects = await Subject.find({ collegeId: req.user.collegeId })
      .populate('branchId', 'name')
      .sort({ name: 1 });
    res.json(subjects);
  } catch (error) {
    console.error('List all subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const { name, branchId, years } = req.body;

    const branch = await Branch.findOne({ _id: branchId, collegeId });
    if (!branch) {
      return res.status(400).json({ message: 'Invalid branch' });
    }

    const subject = await Subject.create({
      name: name.trim(),
      branchId,
      collegeId,
      years: Array.isArray(years) ? years.map(Number).filter((n) => n >= 1 && n <= 6) : [],
    });
    await subject.populate('branchId', 'name');
    res.status(201).json(subject);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This subject already exists for this branch' });
    }
    console.error('Create subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const { name, branchId, years } = req.body;

    const subject = await Subject.findOne({
      _id: req.params.id,
      collegeId,
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (branchId && branchId !== subject.branchId.toString()) {
      const branch = await Branch.findOne({ _id: branchId, collegeId });
      if (!branch) return res.status(400).json({ message: 'Invalid branch' });
      subject.branchId = branchId;
    }

    if (name) subject.name = name.trim();
    if (years !== undefined) {
      subject.years = Array.isArray(years) ? years.map(Number).filter((n) => n >= 1 && n <= 6) : [];
    }

    await subject.save();
    await subject.populate('branchId', 'name');
    res.json(subject);
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      collegeId: req.user.collegeId,
    });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
