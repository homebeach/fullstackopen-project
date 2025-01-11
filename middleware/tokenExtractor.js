const jwt = require('jsonwebtoken');
const { Session, User } = require('../models'); // Adjust paths as needed
const { SECRET } = require('../util/config');

const tokenExtractor = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, SECRET);

    // Check if the session exists and is active
    const session = await Session.findOne({ where: { token, userId: decoded.id } });
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check if the user exists and is active
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.disabled) {
      return res.status(403).json({ error: 'User is disabled' });
    }

    req.authUser = user; // Attach the logged-in user object to `req.authUser`
    req.token = token; // Optionally attach the token to the request
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = tokenExtractor;
