const router = require('express').Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const tokenExtractor = require('../middleware/tokenExtractor');

// Middleware to check if the user is logged in and has the correct role
router.use(tokenExtractor);

// Middleware to find a user by ID
const userFinderById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.targetUser = user; // Attach the target user to `req.targetUser`
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
router.post('/', tokenExtractor, async (req, res, next) => {
  try {
    const { username, firstname, lastname, user_type, password } = req.body;

    // Validate input fields
    if (!username || !firstname || !lastname || !password) {
      return res.status(400).json({ error: 'Username, firstname, lastname, and password are required' });
    }

    // Default to 'Customer' if no user type is provided
    let userType = user_type || 'Customer';

    // Check the role of the logged-in user and set userType constraints
    if (req.authUser) {
      if (req.authUser.userType === 'Customer') {
        // Customers can only create 'Customer' accounts
        userType = 'Customer';
      } else if (req.authUser.userType === 'Librarian') {
        // Librarians can create 'Customer' or 'Librarian' accounts
        if (!['Customer', 'Librarian'].includes(userType)) {
          return res.status(403).json({ error: 'Librarians can only create Customer or Librarian accounts' });
        }
      } else if (req.authUser.userType === 'Admin') {
        // Admins can create accounts with any valid user type
        if (!['Customer', 'Librarian', 'Admin'].includes(userType)) {
          return res.status(400).json({ error: 'Invalid user type' });
        }
      } else {
        // If the logged-in user type is invalid
        return res.status(403).json({ error: 'Unauthorized user type' });
      }
    } else {
      // If no user is logged in, only 'Customer' accounts can be created
      userType = 'Customer';
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Create the new user
    const user = await User.create({
      username,
      firstname,
      lastname,
      userType, // Set the userType based on the checks
      password: hashedPassword,
    });

    // Respond with the created user (excluding the password)
    const { id, username: createdUsername, firstname: createdFirstname, lastname: createdLastname, userType: createdUserType } = user;
    res.status(201).json({
      id,
      username: createdUsername,
      firstname: createdFirstname,
      lastname: createdLastname,
      userType: createdUserType,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:username: Change user details (logged-in user only)
router.put('/:username', tokenExtractor, async (req, res, next) => {
  try {
    const {
      newUsername,
      newPassword,
      firstname,
      lastname,
      otherNames,
      userType, // Only editable based on permissions
    } = req.body;

    // Ensure the logged-in user matches the target username
    if (req.user.username !== req.params.username) {
      return res.status(403).json({ error: 'You can only modify your own account' });
    }

    // Check if the user is disabled
    if (req.user.disabled) {
      return res.status(403).json({ error: 'Your account is disabled and cannot be modified' });
    }

    let changes = [];

    // Update the username if provided
    if (newUsername) {
      req.user.username = newUsername;
      changes.push('Username updated');
    }

    // Update the password if provided
    if (newPassword) {
      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash the new password
      req.user.password = hashedPassword;
      changes.push('Password updated');
    }

    // Update firstname if provided
    if (firstname) {
      req.user.firstname = firstname;
      changes.push('First name updated');
    }

    // Update lastname if provided
    if (lastname) {
      req.user.lastname = lastname;
      changes.push('Last name updated');
    }

    // Update otherNames if provided
    if (otherNames) {
      req.user.otherNames = otherNames;
      changes.push('Other names updated');
    }

    // Update userType based on role permissions
    if (userType) {
      if (req.user.userType === 'Admin') {
        // Admins can update to any valid userType
        if (!['Customer', 'Librarian', 'Admin'].includes(userType)) {
          return res.status(400).json({ error: 'Invalid userType value' });
        }
        req.user.userType = userType;
        changes.push('User type updated');
      } else if (req.user.userType === 'Librarian') {
        // Librarians can only update Customer to Librarian
        if (req.user.userType !== 'Customer' || userType !== 'Librarian') {
          return res.status(403).json({ error: 'Librarians can only update Customers to Librarian' });
        }
        req.user.userType = userType;
        changes.push('User type updated');
      } else {
        // Customers cannot update userType
        return res.status(403).json({ error: 'You do not have permission to update userType' });
      }
    }

    // Save the changes
    await req.user.save();

    // Build a response message
    const message =
      changes.length > 0 ? changes.join(', ') : 'No changes were made';

    res.json({ message, user: { username: req.user.username } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id: Delete a user by ID (Librarian can delete Customer, Admin can delete any)
router.delete('/:id', tokenExtractor, userFinderById, async (req, res, next) => {
  try {
    console.log('Logged-in user:', req.authUser);
    console.log('Target user:', req.targetUser);

    // Check if the logged-in user is an Admin
    if (req.authUser.userType === 'Admin') {
      // Admins can delete any user
      await req.targetUser.destroy();
      return res.status(204).send(); // No content response for successful deletion
    }

    // Check if the logged-in user is a Librarian
    if (req.authUser.userType === 'Librarian') {
      // Librarians can only delete Customers
      if (req.targetUser.userType !== 'Customer') {
        return res
          .status(403)
          .json({ error: 'Librarians can only delete Customers' });
      }
      await req.targetUser.destroy();
      return res.status(204).send(); // No content response for successful deletion
    }

    // If neither Admin nor Librarian, deny access
    return res
      .status(403)
      .json({ error: 'You do not have permission to delete this user' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
