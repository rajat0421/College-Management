const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    years: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
);

subjectSchema.index({ collegeId: 1, branchId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
