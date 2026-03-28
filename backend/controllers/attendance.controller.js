const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Branch = require('../models/Branch');

function subjectAppliesToYear(subject, yearNum) {
  const y = Number(yearNum);
  if (!subject.years || subject.years.length === 0) return true;
  return subject.years.includes(y);
}

exports.markAttendance = async (req, res) => {
  try {
    const { collegeId, userId } = req.user;
    const { date, records, branchId, subjectId, year } = req.body;

    const branch = await Branch.findOne({ _id: branchId, collegeId });
    if (!branch) {
      return res.status(400).json({ message: 'Invalid branch' });
    }

    const subject = await Subject.findOne({ _id: subjectId, collegeId, branchId });
    if (!subject) {
      return res.status(400).json({ message: 'Invalid subject for this branch' });
    }

    const yearNum = Number(year);
    if (!subjectAppliesToYear(subject, yearNum)) {
      return res.status(400).json({ message: 'This subject does not apply to the selected year' });
    }

    const studentIds = records.map((r) => r.studentId);
    const validCount = await Student.countDocuments({
      _id: { $in: studentIds },
      collegeId,
      branchId,
      year: yearNum,
      isActive: true,
    });

    if (validCount !== studentIds.length) {
      return res.status(400).json({ message: 'One or more students do not match branch/year' });
    }

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const operations = records.map((record) => ({
      updateOne: {
        filter: {
          studentId: new mongoose.Types.ObjectId(record.studentId),
          subjectId: new mongoose.Types.ObjectId(subjectId),
          branchId: new mongoose.Types.ObjectId(branchId),
          year: yearNum,
          date: normalizedDate,
          collegeId,
        },
        update: {
          $set: {
            status: record.status,
            markedBy: userId,
            collegeId,
            branchId,
            subjectId,
            year: yearNum,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(operations);

    res.json({ message: `Attendance marked for ${records.length} students` });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const { date, branchId, year, subjectId } = req.query;

    if (!date || !branchId || !year || !subjectId) {
      return res.status(400).json({ message: 'date, branchId, year, and subjectId are required' });
    }

    const branch = await Branch.findOne({ _id: branchId, collegeId });
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    const subject = await Subject.findOne({ _id: subjectId, collegeId, branchId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found for this branch' });
    }

    const yearNum = Number(year);
    if (!subjectAppliesToYear(subject, yearNum)) {
      return res.status(400).json({ message: 'This subject does not apply to the selected year' });
    }

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const studentFilter = {
      collegeId,
      isActive: true,
      branchId,
      year: yearNum,
    };

    const students = await Student.find(studentFilter).populate('branchId', 'name').sort({ name: 1 });

    const attendanceRecords = await Attendance.find({
      collegeId,
      date: normalizedDate,
      subjectId,
      branchId,
      year: yearNum,
      studentId: { $in: students.map((s) => s._id) },
    });

    const attendanceMap = {};
    attendanceRecords.forEach((record) => {
      attendanceMap[record.studentId.toString()] = record.status;
    });

    const result = students.map((student) => ({
      _id: student._id,
      name: student.name,
      rollNumber: student.rollNumber,
      year: student.year,
      branchName: student.branchId?.name || '—',
      status: attendanceMap[student._id.toString()] || null,
    }));

    res.json(result);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAttendanceReport = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const { startDate, endDate, branchId, year, subjectId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    const studentFilter = { collegeId, isActive: true };
    if (branchId) studentFilter.branchId = branchId;
    if (year) studentFilter.year = Number(year);

    const students = await Student.find(studentFilter).populate('branchId', 'name').sort({ name: 1 });

    const recordFilter = {
      collegeId,
      date: { $gte: start, $lte: end },
      studentId: { $in: students.map((s) => s._id) },
    };
    if (year) recordFilter.year = Number(year);
    if (subjectId) recordFilter.subjectId = subjectId;

    const records = await Attendance.find(recordFilter);

    const report = students.map((student) => {
      const studentRecords = records.filter(
        (r) =>
          r.studentId.toString() === student._id.toString() &&
          r.year === student.year
      );
      const present = studentRecords.filter((r) => r.status === 'present').length;
      const absent = studentRecords.filter((r) => r.status === 'absent').length;
      const total = present + absent;

      return {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        year: student.year,
        branchName: student.branchId?.name || '—',
        present,
        absent,
        total,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      };
    });

    res.json(report);
  } catch (error) {
    console.error('Get attendance report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
