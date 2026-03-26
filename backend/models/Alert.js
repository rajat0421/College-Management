const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
  },
  type: {
    type: String,
    enum: ['low_attendance', 'consecutive_absent'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  sentTo: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

alertSchema.index({ collegeId: 1, sentAt: -1 });
alertSchema.index({ studentId: 1, type: 1, sentAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
