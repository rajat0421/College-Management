const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

exports.getSmartReport = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const { course, year } = req.query;

    const studentFilter = { collegeId, isActive: true };
    if (course) studentFilter.course = course;
    if (year) studentFilter.year = Number(year);

    const students = await Student.find(studentFilter).sort({ name: 1 });
    if (students.length === 0) {
      return res.json([]);
    }

    const studentIds = students.map((s) => s._id);

    const allRecords = await Attendance.find({
      collegeId,
      studentId: { $in: studentIds },
    }).sort({ date: -1 });

    const recordsByStudent = {};
    allRecords.forEach((r) => {
      const sid = r.studentId.toString();
      if (!recordsByStudent[sid]) recordsByStudent[sid] = [];
      recordsByStudent[sid].push(r);
    });

    const report = students.map((student) => {
      const records = recordsByStudent[student._id.toString()] || [];
      const total = records.length;
      const present = records.filter((r) => r.status === 'present').length;
      const absent = total - present;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

      let consecutiveAbsent = 0;
      for (const record of records) {
        if (record.status === 'absent') {
          consecutiveAbsent++;
        } else {
          break;
        }
      }

      const lowAttendance = total > 0 && percentage < 75;
      const absentStreak = consecutiveAbsent >= 3;

      return {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        course: student.course,
        year: student.year,
        parentEmail: student.parentEmail,
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
