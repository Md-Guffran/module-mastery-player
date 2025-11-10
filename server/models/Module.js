const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  videos: [
    {
      title: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      notesUrl: [String], // Correctly defined as an array of strings
      duration: {
        type: Number,
        required: true,
        min: 1, // Duration must be at least 1 second
      },
    },
  ],
  assessments: [{ // New field for multiple assessments, directly under ModuleSchema
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
  }],
});

const Module = mongoose.model('Module', ModuleSchema);

module.exports = Module;
