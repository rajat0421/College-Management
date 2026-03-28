const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Attendance = require('../models/Attendance');
const Alert = require('../models/Alert');
const { consecutiveAbsentCalendarDays } = require('../utils/attendanceStats');

exports.getStats = async (req, res) => {
  try {
    const { collegeId } = req.user;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const students = await Student.find({ collegeId, isActive: true }).populate('branchId', 'name');
    const studentIds = students.map((s) => s._id);

    const [totalTeachers, todayAttendance, allRecords, recentAlerts] = await Promise.all([
      Teacher.countDocuments({ collegeId }),
      Attendance.find({ collegeId, date: today }),
      Attendance.find({ collegeId, studentId: { $in: studentIds } }).sort({ date: -1 }),
      Alert.find({ collegeId })
        .sort({ sentAt: -1 })
        .limit(5)
        .populate('studentId', 'name rollNumber'),
    ]);

    const presentToday = todayAttendance.filter((a) => a.status === 'present').length;
    const absentToday = todayAttendance.filter((a) => a.status === 'absent').length;

    const recordsByStudent = {};
    allRecords.forEach((r) => {
      const sid = r.studentId.toString();
      if (!recordsByStudent[sid]) recordsByStudent[sid] = [];
      recordsByStudent[sid].push(r);
    });

    let lowAttendanceCount = 0;
    let consecutiveAbsentCount = 0;
    const atRiskStudents = [];

    students.forEach((student) => {
      const raw = recordsByStudent[student._id.toString()] || [];
      const records = raw.filter((r) => r.year === student.year);
      const total = records.length;
      if (total === 0) return;

      const present = records.filter((r) => r.status === 'present').length;
      const percentage = Math.round((present / total) * 100);

      const consecutiveAbsent = consecutiveAbsentCalendarDays(records);

      const isLow = percentage < 75;
      const isStreak = consecutiveAbsent >= 3;

      if (isLow) lowAttendanceCount++;
      if (isStreak) consecutiveAbsentCount++;

      if (isLow || isStreak) {
        atRiskStudents.push({
          _id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          branchName: student.branchId?.name || '—',
          year: student.year,
          percentage,
          consecutiveAbsent,
          flags: { lowAttendance: isLow, absentStreak: isStreak },
        });
      }
    });

    atRiskStudents.sort((a, b) => a.percentage - b.percentage);

    res.json({
      totalStudents: students.length,
      totalTeachers,
      todayAttendance: {
        present: presentToday,
        absent: absentToday,
        total: todayAttendance.length,
        marked: todayAttendance.length > 0,
      },
      lowAttendanceCount,
      consecutiveAbsentCount,
      atRiskStudents: atRiskStudents.slice(0, 5),
      recentAlerts,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
