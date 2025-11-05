const mongoose = require('mongoose');

const UserAssessmentProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  dayId: {
    type: String, // This will store the day's unique ID (e.g., "week1-day1")
    required: true,
  },
  assessmentTitle: {
    type: String,
    required: true,
  },
  assessmentLink: { // Link provided by the course creator
    type: String,
    required: true,
  },
  submittedLink: { // Link submitted by the user
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'waiting for review', 'completed', 'failed'],
    default: 'pending',
  },
  submissionDate: {
    type: Date,
  },
  reviewDate: {
    type: Date,
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  feedback: {
    type: String,
    default: '',
  },
}, { timestamps: true });

// Ensure unique assessment progress per user, course, and day
UserAssessmentProgressSchema.index({ userId: 1, courseId: 1, dayId: 1 }, { unique: true });

module.exports = mongoose.model('UserAssessmentProgress', UserAssessmentProgressSchema);
