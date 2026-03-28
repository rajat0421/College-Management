const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    rollNumber: {
      type: String,
      trim: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 1,
      max: 6,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

studentSchema.index({ collegeId: 1, branchId: 1, year: 1 });

module.exports = mongoose.model('Student', studentSchema);
