const router = require('express').Router();
const { User } = require('../models');
const tokenExtractor = require('../middleware/tokenExtractor');

// Middleware to find a user by ID
const userFinderById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.user = user; // Attach the user to the request
    next();
  } catch (error) {
    next(error);
  }
};

// GET /api/users: List all users
router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'firstname', 'lastname', 'user_type', 'created_at'],
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id: Retrieve a user's details
router.get('/:id', userFinderById, async (req, res, next) => {
  try {
    const userData = {
      id: req.user.id,
      username: req.user.username,
      firstname: req.user.firstname,
      lastname: req.user.lastname,
      user_type: req.user.user_type,
      created_at: req.user.created_at,
    };

    res.json(userData);
  } catch (error) {
    next(error);
  }
});

// POST /api/users: Add a new user
router.post('/', async (req, res, next) => {
  try {
    const { username, firstname, lastname, user_type } = req.body;

    if (!username || !firstname || !lastname || !user_type) {
      const error = new Error('Username, firstname, lastname, and user_type are required');
      error.name = 'ValidationError';
      throw error;
    }

    const user = await User.create({ username, firstname, lastname, user_type });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:username: Change username (logged-in user only)
router.put('/:username', tokenExtractor, async (req, res, next) => {
  try {
    const { newUsername } = req.body;

    // Validate the new username input
    if (!newUsername) {
      return res.status(400).json({ error: 'New username is required' });
    }

    // Ensure the logged-in user matches the target username
    if (req.user.username !== req.params.username) {
      return res.status(403).json({ error: 'You can only change your own username' });
    }

    // Check if the user is disabled
    if (req.user.disabled) {
      return res.status(403).json({ error: 'Your account is disabled and cannot be modified' });
    }

    // Update the username
    req.user.username = newUsername;
    await req.user.save();

    res.json({ message: 'Username updated successfully', user: req.user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
