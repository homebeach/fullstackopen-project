const router = require('express').Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
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
    const { username, firstname, lastname, user_type, password } = req.body;

    // Validate input fields
    if (!username || !firstname || !lastname || !user_type || !password) {
      const error = new Error('Username, firstname, lastname, user_type, and password are required');
      error.name = 'ValidationError';
      throw error;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Create the new user
    const user = await User.create({
      username,
      firstname,
      lastname,
      userType: user_type, // Ensure this matches the model's column name
      password: hashedPassword,
    });

    // Respond with the created user (excluding the password)
    const { id, username: createdUsername, firstname: createdFirstname, lastname: createdLastname, userType } = user;
    res.status(201).json({ id, username: createdUsername, firstname: createdFirstname, lastname: createdLastname, userType });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:username: Change username or password (logged-in user only)
router.put('/:username', tokenExtractor, async (req, res, next) => {
  try {
    const { newUsername, newPassword } = req.body;

    // Ensure the logged-in user matches the target username
    if (req.user.username !== req.params.username) {
      return res.status(403).json({ error: 'You can only modify your own account' });
    }

    // Check if the user is disabled
    if (req.user.disabled) {
      return res.status(403).json({ error: 'Your account is disabled and cannot be modified' });
    }

    // Update the username if provided
    if (newUsername) {
      req.user.username = newUsername;
    }

    // Update the password if provided
    if (newPassword) {
      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash the new password
      req.user.password = hashedPassword;
    }

    // Save the changes
    await req.user.save();

    res.json({ message: 'User updated successfully', user: { username: req.user.username } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
