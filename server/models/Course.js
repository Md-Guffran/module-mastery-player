const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  weeks: [{
    weekNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    days: [{
      dayNumber: {
        type: Number,
        required: true,
        min: 1,
      },
      modules: [{
        type: Schema.Types.ObjectId,
        ref: 'Module',
      }],
    }],
  }],
  skills: {
    type: String,
    default: '',
  },
  tools: {
    type: String,
    default: '',
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  duration: {
    type: String,
    default: '0',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Course', CourseSchema);
