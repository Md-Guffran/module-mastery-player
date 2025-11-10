const express = require('express');
const router = express.Router();
const fs = require('fs');
const User = require('../models/User');
const Module = require('../models/Module');
const Session = require('../models/Session'); // Import Session model
const UserProgress = require('../models/UserProgress');
const Course = require('../models/Course'); // Import the new Course model
const auth = require('../middleware/auth');

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

// @route   POST api/admin/modules
// @desc    Create a new module (standalone, not tied to course yet)
// @access  Admin
router.post('/modules', auth, isAdmin, async (req, res) => {
  try {
    const { title, videos } = req.body; // Removed week and day from module creation

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
    const { title, concepts, exercises, videos, assessments } = req.body; // Extract all fields
    const moduleFields = { 
      title, 
      concepts: concepts || '',
      exercises: exercises || '',
      videos, 
      assessments 
    }; // Include all fields in update

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

// --- New routes for Course Management ---

// @route   POST api/admin/courses
// @desc    Create a new course
// @access  Admin
router.post('/courses', auth, isAdmin, async (req, res) => {
  try {
    const { title, description, skills, tools, level, duration, weeks } = req.body; // Changed from modules to weeks

    // Basic validation
    if (!title || !description) {
      return res.status(400).json({ message: 'Course title and description are required.' });
    }

    const newCourse = new Course({
      title,
      description,
      skills,
      tools,
      level,
      duration,
      weeks: weeks || [], // Initialize with empty weeks array if not provided
    });

    await newCourse.save(); // Save to database

    res.status(201).json(newCourse); // Respond with the created course
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Server error while creating course.' });
  }
});

// @route   GET api/admin/courses
// @desc    Get all courses
// @access  Authenticated Users (Admin and regular users)
router.get('/courses', auth, async (req, res) => {
  try {
    const courses = await Course.find().populate({
      path: 'weeks.days.modules',
      model: 'Module'
    });
    res.json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/courses/:courseId
// @desc    Get a single course with its full content structure
// @access  Authenticated Users (Admin and regular users)
router.get('/courses/:courseId', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).populate({
      path: 'weeks.days.modules',
      model: 'Module'
    });
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    console.error('Error fetching course details:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/courses/:courseId/weeks/:weekNumber/days/:dayNumber/modules
// @desc    Add a module to a specific day within a week of a course
// @access  Admin
router.post('/courses/:courseId/weeks/:weekNumber/days/:dayNumber/modules', auth, isAdmin, async (req, res) => {
  try {
    const { courseId, weekNumber, dayNumber } = req.params;
    const { title, concepts, exercises, videos, assessments } = req.body; // Extract all fields

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    const week = course.weeks.find(w => w.weekNumber === Number(weekNumber));
    if (!week) {
      return res.status(404).json({ msg: `Week ${weekNumber} not found in course.` });
    }

    const day = week.days.find(d => d.dayNumber === Number(dayNumber));
    if (!day) {
      return res.status(404).json({ msg: `Day ${dayNumber} not found in Week ${weekNumber}.` });
    }

    const newModule = new Module({
      title,
      concepts: concepts || '',
      exercises: exercises || '',
      videos,
      assessments, // Pass assessments to the Module constructor
    });

    const savedModule = await newModule.save();
    day.modules.push(savedModule._id);
    await course.save();

    const updatedCourse = await Course.findById(courseId).populate({
      path: 'weeks.days.modules',
      model: 'Module'
    });
    res.status(201).json(updatedCourse);
  } catch (err) {
    console.error('Error adding module to course:', err.stack); // Log full error stack
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/courses/:courseId/weeks
// @desc    Add a new week to a course
// @access  Admin
router.post('/courses/:courseId/weeks', auth, isAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { weekNumber } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    if (course.weeks.some(w => w.weekNumber === weekNumber)) {
      return res.status(400).json({ msg: `Week ${weekNumber} already exists.` });
    }

    course.weeks.push({ weekNumber, days: [] });
    await course.save();

    const updatedCourse = await Course.findById(courseId).populate({
      path: 'weeks.days.modules',
      model: 'Module'
    });
    res.status(201).json(updatedCourse);
  } catch (err) {
    console.error('Error adding week to course:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/courses/:courseId/weeks/:weekNumber/days
// @desc    Add a new day to a specific week of a course
// @access  Admin
router.post('/courses/:courseId/weeks/:weekNumber/days', auth, isAdmin, async (req, res) => {
  try {
    const { courseId, weekNumber } = req.params;
    const { dayNumber, assessment, assessmentLink } = req.body; // Extract day fields from body

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    const week = course.weeks.find(w => w.weekNumber === Number(weekNumber));
    if (!week) {
      return res.status(404).json({ msg: `Week ${weekNumber} not found in course.` });
    }

    if (week.days.some(d => d.dayNumber === dayNumber)) {
      return res.status(400).json({ msg: `Day ${dayNumber} already exists in Week ${weekNumber}.` });
    }

    // Push new day with provided or default data
    week.days.push({
      dayNumber,
      modules: [],
      assessment: assessment || '',  // Default if not provided
      assessmentLink: assessmentLink || ''  // Default if not provided
    });
    await course.save();

    const updatedCourse = await Course.findById(courseId).populate({
      path: 'weeks.days.modules',
      model: 'Module'
    });
    res.status(201).json(updatedCourse);
  } catch (err) {
    console.error('Error adding day to week:', err.stack); // Log full error stack
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/courses/:courseId/weeks/:weekNumber
// @desc    Delete a week from a course
// @access  Admin
router.delete('/courses/:courseId/weeks/:weekNumber', auth, isAdmin, async (req, res) => {
  try {
    const { courseId, weekNumber } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    const initialWeekCount = course.weeks.length;
    course.weeks = course.weeks.filter(w => w.weekNumber !== Number(weekNumber));

    if (course.weeks.length === initialWeekCount) {
      return res.status(404).json({ msg: `Week ${weekNumber} not found.` });
    }

    await course.save();
    res.json({ msg: `Week ${weekNumber} removed successfully.` });
  } catch (err) {
    console.error('Error deleting week from course:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/courses/:courseId/weeks/:weekNumber/days/:dayNumber
// @desc    Update a day in a specific week of a course (including assessment fields)
// @access  Admin
router.put('/courses/:courseId/weeks/:weekNumber/days/:dayNumber', auth, isAdmin, async (req, res) => {
  try {
    const { courseId, weekNumber, dayNumber } = req.params;
    const { assessment, assessmentLink } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    const week = course.weeks.find(w => w.weekNumber === Number(weekNumber));
    if (!week) {
      return res.status(404).json({ msg: `Week ${weekNumber} not found.` });
    }

    const day = week.days.find(d => d.dayNumber === Number(dayNumber));
    if (!day) {
      return res.status(404).json({ msg: `Day ${dayNumber} not found in Week ${weekNumber}.` });
    }

    if (assessment !== undefined) {
      day.assessment = assessment;
    }
    if (assessmentLink !== undefined) {
      day.assessmentLink = assessmentLink;
    }

    await course.save();

    const updatedCourse = await Course.findById(courseId).populate({
      path: 'weeks.days.modules',
      model: 'Module'
    });
    res.json(updatedCourse);
  } catch (err) {
    console.error('Error updating day in week:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/courses/:courseId/weeks/:weekNumber/days/:dayNumber
// @desc    Delete a day from a specific week of a course
// @access  Admin
router.delete('/courses/:courseId/weeks/:weekNumber/days/:dayNumber', auth, isAdmin, async (req, res) => {
  try {
    const { courseId, weekNumber, dayNumber } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    const week = course.weeks.find(w => w.weekNumber === Number(weekNumber));
    if (!week) {
      return res.status(404).json({ msg: `Week ${weekNumber} not found.` });
    }

    const initialDayCount = week.days.length;
    week.days = week.days.filter(d => d.dayNumber !== Number(dayNumber));

    if (week.days.length === initialDayCount) {
      return res.status(404).json({ msg: `Day ${dayNumber} not found in Week ${weekNumber}.` });
    }

    await course.save();
    res.json({ msg: `Day ${dayNumber} removed from Week ${weekNumber} successfully.` });
  } catch (err) {
    console.error('Error deleting day from week:', err.message);
    res.status(500).send('Server Error');
  }
});

console.log('Admin routes file loaded successfully!');

module.exports = router;
