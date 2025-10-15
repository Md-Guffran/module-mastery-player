const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lessonId: {
    type: String,
    required: true,
  },
  lessonTitle: {
    type: String,
    required: true,
  },
  watchedSeconds: {
    type: Number,
    required: true,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
UserProgressSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

UserProgressSchema.index({ user: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', UserProgressSchema);
