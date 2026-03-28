const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
  },
  { timestamps: true }
);

branchSchema.index({ collegeId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Branch', branchSchema);
