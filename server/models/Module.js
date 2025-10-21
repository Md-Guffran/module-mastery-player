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
        default: 0,
      },
    },
  ],
});

const Module = mongoose.model('Module', ModuleSchema);

module.exports = Module;
