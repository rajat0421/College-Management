const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { consecutiveAbsentCalendarDays } = require('../utils/attendanceStats');

exports.getSmartReport = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const { branchId, year } = req.query;

    const studentFilter = { collegeId, isActive: true };
    if (branchId) studentFilter.branchId = branchId;
    if (year) studentFilter.year = Number(year);

    const students = await Student.find(studentFilter).populate('branchId', 'name').sort({ name: 1 });
    if (students.length === 0) {
      return res.json([]);
    }

    const studentIds = students.map((s) => s._id);

    const yearNum = year ? Number(year) : null;
    const attendanceFilter = { collegeId, studentId: { $in: studentIds } };
    if (yearNum) attendanceFilter.year = yearNum;

    const allRecords = await Attendance.find(attendanceFilter).sort({ date: -1 });

    const recordsByStudent = {};
    allRecords.forEach((r) => {
      const sid = r.studentId.toString();
      if (!recordsByStudent[sid]) recordsByStudent[sid] = [];
      recordsByStudent[sid].push(r);
    });

    const report = students.map((student) => {
      let records = recordsByStudent[student._id.toString()] || [];
      if (!yearNum) {
        records = records.filter((r) => r.year === student.year);
      }
      const total = records.length;
      const present = records.filter((r) => r.status === 'present').length;
      const absent = total - present;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

      const consecutiveAbsent = consecutiveAbsentCalendarDays(records);

      const lowAttendance = total > 0 && percentage < 75;
      const absentStreak = consecutiveAbsent >= 3;

      return {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        branchName: student.branchId?.name || '—',
        year: student.year,
        email: student.email,
        present,
        absent,
        total,
        percentage,
        consecutiveAbsent,
        flags: {
          lowAttendance,
          absentStreak,
        },
      };
    });

    report.sort((a, b) => {
      const aFlagged = a.flags.lowAttendance || a.flags.absentStreak ? 1 : 0;
      const bFlagged = b.flags.lowAttendance || b.flags.absentStreak ? 1 : 0;
      if (aFlagged !== bFlagged) return bFlagged - aFlagged;
      return a.percentage - b.percentage;
    });

    res.json(report);
  } catch (error) {
    console.error('Smart report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
