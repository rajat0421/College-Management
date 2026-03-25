const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Attendance = require('../models/Attendance');

exports.getStats = async (req, res) => {
  try {
    const { collegeId } = req.user;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [totalStudents, totalTeachers, todayAttendance] = await Promise.all([
      Student.countDocuments({ collegeId, isActive: true }),
      Teacher.countDocuments({ collegeId }),
      Attendance.find({ collegeId, date: today }),
    ]);

    const presentToday = todayAttendance.filter((a) => a.status === 'present').length;
    const absentToday = todayAttendance.filter((a) => a.status === 'absent').length;

    res.json({
      totalStudents,
      totalTeachers,
      todayAttendance: {
        present: presentToday,
        absent: absentToday,
        total: todayAttendance.length,
        marked: todayAttendance.length > 0,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
