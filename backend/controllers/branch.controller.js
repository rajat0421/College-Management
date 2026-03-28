const Branch = require('../models/Branch');

exports.list = async (req, res) => {
  try {
    const branches = await Branch.find({ collegeId: req.user.collegeId }).sort({ name: 1 });
    res.json(branches);
  } catch (error) {
    console.error('List branches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const branch = await Branch.create({
      name: req.body.name.trim(),
      collegeId: req.user.collegeId,
    });
    res.status(201).json(branch);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A branch with this name already exists' });
    }
    console.error('Create branch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const branch = await Branch.findOneAndUpdate(
      { _id: req.params.id, collegeId: req.user.collegeId },
      { name: req.body.name.trim() },
      { returnDocument: 'after', runValidators: true }
    );
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json(branch);
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const branch = await Branch.findOneAndDelete({
      _id: req.params.id,
      collegeId: req.user.collegeId,
    });
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json({ message: 'Branch deleted' });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
