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

// @route   GET api/course/search
// @desc    Search courses by title or description
// @access  Public
// NOTE: This route must be defined BEFORE /:courseTitle route to avoid route conflicts
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ msg: 'Query parameter "query" is required' });
    }

    const courses = await Course.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    }).populate('modules');

    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/course/modules
// @desc    Get all modules
// @access  Public
// NOTE: This route must be defined BEFORE /:courseTitle route to avoid route conflicts
router.get('/modules', async (req, res) => {
  try {
    const modules = await Module.find().populate('videos');
    res.json(modules);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/course/courses/:id
// @desc    Get a single course by ID and its modules
// @access  Public
router.get('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('modules');

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

// @route   GET api/course/:courseTitle
// @desc    Get a single course and its modules by title
// @access  Public
// NOTE: This route should be defined LAST to avoid matching specific routes like /search or /modules
router.get('/:courseTitle', async (req, res) => {
  try {
    const course = await Course.findOne({ title: req.params.courseTitle }).populate('modules');

    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.json(course); // Return the entire course object, including modules
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
