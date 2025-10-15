const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const UserProgress = require('../models/UserProgress');

// @route   POST api/progress
// @desc    Save user progress
// @access  Private
router.post('/', auth, async (req, res) => {
  const { lessonId, lessonTitle, watchedSeconds, completed } = req.body;
  try {
    let progress = await UserProgress.findOne({
      user: req.user.id,
      lessonId,
    });

    if (progress) {
      // Update progress
      progress.watchedSeconds = watchedSeconds;
      progress.lessonTitle = lessonTitle; // Update lessonTitle
      if (completed) {
        progress.completed = completed;
      }
      await progress.save();
    } else {
      // Create new progress
      progress = new UserProgress({
        user: req.user.id,
        lessonId,
        lessonTitle, // Save lessonTitle
        watchedSeconds,
        completed,
      });
      await progress.save();
    }
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/progress/:lessonId
// @desc    Get user progress for a lesson
// @access  Private
router.get('/:lessonId', auth, async (req, res) => {
  try {
    const progress = await UserProgress.findOne({
      user: req.user.id,
      lessonId: req.params.lessonId,
    });

    if (!progress) {
      return res.json({ watchedSeconds: 0, completed: false, lessonTitle: '' });
    }

    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/progress
// @desc    Get all progress for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const progress = await UserProgress.find({ user: req.user.id }).select('lessonId lessonTitle watchedSeconds completed updatedAt');
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
