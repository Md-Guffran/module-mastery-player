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
      resourcesUrl: {
        type: String,
      },
      notesUrl: {
        type: String,
      },
      duration: {
        type: Number,
        required: true,
        min: 1, // Duration must be at least 1 second
      },
    },
  ],
});

const Module = mongoose.model('Module', ModuleSchema);

module.exports = Module;
