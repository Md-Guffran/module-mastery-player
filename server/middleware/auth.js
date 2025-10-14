const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User model

module.exports = async function(req, res, next) { // Mark as async
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from DB to get the role
    const user = await User.findById(decoded.user.id).select('role');
    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    req.user = {
      id: decoded.user.id,
      sessionId: decoded.user.sessionId,
      role: user.role,
    };
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
