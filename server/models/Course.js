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
  modules: [{
    type: Schema.Types.ObjectId,
    ref: 'Module', // Assuming you have a Module model
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Course', CourseSchema);
