const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const Course = require('../models/Course'); // Import Course model

// @route   GET api/course
// @desc    Get all courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('modules');
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/course/:courseTitle
// @desc    Get a single course and its modules by title
// @access  Public
router.get('/:courseTitle', async (req, res) => {
  try {
    const course = await Course.findOne({ title: req.params.courseTitle }).populate({
      path: 'modules',
      populate: {
        path: 'videos',
        model: 'Module' // Assuming 'videos' is a field in your Module model
      }
    });

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.json(course); // Return the entire course object, including modules
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET api/course/:id
// @desc    Get a single course by ID and its modules
// @access  Public
router.get('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: 'modules',
      populate: {
        path: 'videos',
        model: 'Module'
      }
    });

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
