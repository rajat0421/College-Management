const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

exports.markAttendance = async (req, res) => {
  try {
    const { collegeId, userId } = req.user;
    const { date, records } = req.body;

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const operations = records.map((record) => ({
      updateOne: {
        filter: {
          studentId: record.studentId,
          date: normalizedDate,
          collegeId,
        },
        update: {
          $set: {
            status: record.status,
            markedBy: userId,
            collegeId,
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
    const { date, course, year } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const studentFilter = { collegeId, isActive: true };
    if (course) studentFilter.course = course;
    if (year) studentFilter.year = Number(year);

    const students = await Student.find(studentFilter).sort({ name: 1 });

    const attendanceRecords = await Attendance.find({
      collegeId,
      date: normalizedDate,
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
      course: student.course,
      year: student.year,
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
    const { startDate, endDate, course, year } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    const studentFilter = { collegeId, isActive: true };
    if (course) studentFilter.course = course;
    if (year) studentFilter.year = Number(year);

    const students = await Student.find(studentFilter).sort({ name: 1 });

    const records = await Attendance.find({
      collegeId,
      date: { $gte: start, $lte: end },
      studentId: { $in: students.map((s) => s._id) },
    });

    const report = students.map((student) => {
      const studentRecords = records.filter(
        (r) => r.studentId.toString() === student._id.toString()
      );
      const present = studentRecords.filter((r) => r.status === 'present').length;
      const absent = studentRecords.filter((r) => r.status === 'absent').length;
      const total = present + absent;

      return {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        course: student.course,
        year: student.year,
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
