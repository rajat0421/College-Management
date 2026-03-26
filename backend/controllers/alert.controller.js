const Alert = require('../models/Alert');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const { sendAlertEmail } = require('../services/email.service');

async function getStudentAlertData(studentId, collegeId) {
  const student = await Student.findOne({ _id: studentId, collegeId, isActive: true });
  if (!student) return null;

  const records = await Attendance.find({ studentId, collegeId }).sort({ date: -1 });
  const total = records.length;
  const present = records.filter((r) => r.status === 'present').length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

  let consecutiveAbsent = 0;
  for (const record of records) {
    if (record.status === 'absent') consecutiveAbsent++;
    else break;
  }

  return { student, percentage, consecutiveAbsent };
}

exports.sendAlert = async (req, res) => {
  try {
    const { collegeId, userId } = req.user;
    const { studentId, type } = req.body;

    if (!studentId || !type) {
      return res.status(400).json({ message: 'studentId and type are required' });
    }

    const data = await getStudentAlertData(studentId, collegeId);
    if (!data) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { student, percentage, consecutiveAbsent } = data;

    if (!student.parentEmail) {
      return res.status(400).json({ message: 'No parent email set for this student' });
    }

    const extraData = type === 'low_attendance'
      ? { percentage }
      : { days: consecutiveAbsent };

    const message = type === 'low_attendance'
      ? `Attendance at ${percentage}%, below required 75%`
      : `Absent for ${consecutiveAbsent} consecutive days`;

    await sendAlertEmail(student.parentEmail, student.name, type, extraData);

    await Alert.create({
      studentId: student._id,
      collegeId,
      type,
      message,
      sentTo: student.parentEmail,
      sentBy: userId,
    });

    res.json({ message: `Alert sent to ${student.parentEmail}` });
  } catch (error) {
    console.error('Send alert error:', error);
    res.status(500).json({ message: error.message || 'Failed to send alert' });
  }
};

exports.sendBulkAlerts = async (req, res) => {
  try {
    const { collegeId, userId } = req.user;
    const { studentIds, type } = req.body;

    if (!studentIds?.length || !type) {
      return res.status(400).json({ message: 'studentIds array and type are required' });
    }

    let sent = 0;
    let skipped = 0;
    const errors = [];

    for (const studentId of studentIds) {
      try {
        const data = await getStudentAlertData(studentId, collegeId);
        if (!data || !data.student.parentEmail) {
          skipped++;
          continue;
        }

        const { student, percentage, consecutiveAbsent } = data;

        const extraData = type === 'low_attendance'
          ? { percentage }
          : { days: consecutiveAbsent };

        const message = type === 'low_attendance'
          ? `Attendance at ${percentage}%, below required 75%`
          : `Absent for ${consecutiveAbsent} consecutive days`;

        await sendAlertEmail(student.parentEmail, student.name, type, extraData);

        await Alert.create({
          studentId: student._id,
          collegeId,
          type,
          message,
          sentTo: student.parentEmail,
          sentBy: userId,
        });

        sent++;
      } catch (err) {
        errors.push({ studentId, error: err.message });
      }
    }

    res.json({
      message: `Alerts sent: ${sent}, skipped: ${skipped}, failed: ${errors.length}`,
      sent,
      skipped,
      errors,
    });
  } catch (error) {
    console.error('Bulk alert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAlertLog = async (req, res) => {
  try {
    const { collegeId } = req.user;
    const { limit = 50 } = req.query;

    const alerts = await Alert.find({ collegeId })
      .sort({ sentAt: -1 })
      .limit(Number(limit))
      .populate('studentId', 'name rollNumber')
      .populate('sentBy', 'name');

    res.json(alerts);
  } catch (error) {
    console.error('Alert log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
