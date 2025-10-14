const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const User = require('../models/User');
const Module = require('../models/Module');
const auth = require('../middleware/auth');

const upload = multer({ dest: 'tmp/csv/' });

// @route   GET api/admin/stats
// @desc    Get admin dashboard stats
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const userCount = await User.countDocuments();
    // In a real application, you would have models for videos and daily activity
    const dailyCount = 0; // Placeholder
    const mostWatchedVideos = []; // Placeholder

    res.json({
      userCount,
      dailyCount,
      mostWatchedVideos,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/upload
// @desc    Upload modules from CSV
// @access  Public (Authorization removed)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Authorization check removed as per user request

    let results = [];
    if (req.file.mimetype === 'text/csv') {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          await processUpload(results, req, res);
        });
    } else {
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      results = xlsx.utils.sheet_to_json(sheet);
      await processUpload(results, req, res);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

const processUpload = async (results, req, res) => {
  try {
    for (const item of results) {
      const { moduleTitle, videoTitle, videoUrl, resourcesUrl, notesUrl } = item;
      let module = await Module.findOne({ title: moduleTitle });
      if (!module) {
        module = new Module({ title: moduleTitle, videos: [] });
      }
      module.videos.push({ title: videoTitle, url: videoUrl, resourcesUrl, notesUrl });
      await module.save();
    }
    fs.unlinkSync(req.file.path); // remove temp file
    res.json({ msg: 'File data imported successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/modules
// @desc    Create a new module
// @access  Public (Authorization removed)
router.post('/', async (req, res) => {
  try {
    const { title, videos } = req.body;

    const newModule = new Module({
      title,
      videos,
    });

    const module = await newModule.save();
    res.json(module);
  } catch (err) {
    console.error(err.stack); // Log the full error stack for debugging
    res.status(500).send('Server Error');
  }
});

module.exports = router;
