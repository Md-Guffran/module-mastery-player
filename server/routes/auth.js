const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session'); // Import Session model
const auth = require('../middleware/auth');

// Signup Route
router.post('/signup', async (req, res) => {
  const { username, email, password, adminVerificationKey } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    let role = 'user'; // Default role
    if (adminVerificationKey) {
      if (adminVerificationKey === process.env.ADMIN_VERIFICATION_KEY) {
        role = 'admin';
      } else {
        return res.status(401).json({ msg: 'Invalid admin verification key. Account not created.' });
      }
    }

    user = new User({
      username,
      email,
      password,
      role,
    });

    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      async (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Signin Route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create a new session entry
    const session = new Session({ userId: user.id, loginTime: new Date() });
    await session.save();

    const payload = {
      user: {
        id: user.id,
        sessionId: session._id, // Store session ID in token
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Signout Route
router.post('/signout', auth, async (req, res) => {
  try {
    const { sessionId } = req.user;
    if (sessionId) {
      await Session.findByIdAndUpdate(sessionId, { logoutTime: new Date() });
    }
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get Logged In User
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
