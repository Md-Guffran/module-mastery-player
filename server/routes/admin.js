const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const User = require('../models/User');
const Module = require('../models/Module');
const Session = require('../models/Session'); // Import Session model
const UserProgress = require('../models/UserProgress');
const auth = require('../middleware/auth');

const upload = multer({ dest: 'tmp/csv/' });

// Helper function to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Admin access denied' });
  }
};

// @route   GET api/admin/stats
// @desc    Get admin dashboard stats
// @access  Admin
router.get('/stats', auth, isAdmin, async (req, res) => {
  console.log('Admin stats route accessed.');
  try {
    const userCount = await User.countDocuments();
    console.log('User count:', userCount);
    // In a real application, you would have models for videos and daily activity
    const dailyCount = 0; // Placeholder
    const mostWatchedVideos = []; // Placeholder

    res.json({
      userCount,
      dailyCount,
      mostWatchedVideos,
    });
  } catch (err) {
    console.error('Error in /api/admin/stats:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', auth, isAdmin, async (req, res) => {
  console.log('Admin users route accessed.');
  try {
    const users = await User.find().select('-password');
    console.log('Fetched users:', users.length, 'users');
    res.json(users);
  } catch (err) {
    console.error('Error in /api/admin/users:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/daily-activity
// @desc    Get today's login/logout activity
// @access  Admin
router.get('/daily-activity', auth, isAdmin, async (req, res) => {
  console.log('Admin daily-activity route accessed.');
  try {
    const startOfDayIST = new Date();
    startOfDayIST.setHours(0, 0, 0, 0);
    startOfDayIST.setMinutes(startOfDayIST.getMinutes() - startOfDayIST.getTimezoneOffset() + 330); // Adjust to IST (UTC+5:30)

    const endOfDayIST = new Date(startOfDayIST);
    endOfDayIST.setDate(startOfDayIST.getDate() + 1);

    console.log('Start of Day IST:', startOfDayIST);
    console.log('End of Day IST:', endOfDayIST);

    const sessions = await Session.find({
      loginTime: { $gte: startOfDayIST, $lt: endOfDayIST },
    }).populate('userId', 'username email'); // Populate user details

    console.log('Fetched sessions:', sessions.length, 'sessions');

    const activity = sessions.map(session => ({
      username: session.userId ? session.userId.username : 'Unknown',
      email: session.userId ? session.userId.email : 'Unknown',
      loginTime: session.loginTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      logoutTime: session.logoutTime ? session.logoutTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Still logged in',
    }));

    res.json(activity);
  } catch (err) {
    console.error('Error in /api/admin/daily-activity:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/upload
// @desc    Upload modules from CSV
// @access  Admin
router.post('/upload', auth, isAdmin, upload.single('file'), async (req, res) => {
  try {
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
// @access  Admin
router.post('/', auth, isAdmin, async (req, res) => {
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

// @route   PUT api/admin/modules/:id
// @desc    Update a module
// @access  Admin
router.put('/modules/:id', auth, isAdmin, async (req, res) => {
  try {
    const { title, videos } = req.body;
    const moduleFields = { title, videos };

    const module = await Module.findByIdAndUpdate(
      req.params.id,
      { $set: moduleFields },
      { new: true }
    );

    if (!module) {
      return res.status(404).json({ msg: 'Module not found' });
    }

    res.json(module);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/modules/:id
// @desc    Delete a module
// @access  Admin
router.delete('/modules/:id', auth, isAdmin, async (req, res) => {
  try {
    const module = await Module.findByIdAndDelete(req.params.id);

    if (!module) {
      return res.status(404).json({ msg: 'Module not found' });
    }

    res.json({ msg: 'Module removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/progress
// @desc    Get all user progress
// @access  Admin
router.get('/progress', auth, isAdmin, async (req, res) => {
  try {
    const progress = await UserProgress.find().populate('user', 'username email');
    res.json(progress);
  } catch (err) {
    console.error('Error in /api/admin/progress:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
