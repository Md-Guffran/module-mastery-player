const express = require('express');
const router = express.Router();
const Module = require('../models/Module');

// @route   GET api/course
// @desc    Get all course modules
// @access  Public
router.get('/', async (req, res) => {
  try {
    const modules = await Module.find();
    res.json(modules);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
