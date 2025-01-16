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
      attributes: ['id', 'username', 'firstname', 'lastname', 'user_type', 'created_at', 'disabled'],
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
      id: req.targetUser.id,
      username: req.targetUser.username,
      firstname: req.targetUser.firstname,
      lastname: req.targetUser.lastname,
      user_type: req.targetUser.user_type,
      created_at: req.targetUser.created_at,
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

router.put('/:id', tokenExtractor, userFinderById, async (req, res, next) => {
  try {
    const {
      username,
      password,
      firstname,
      lastname,
      otherNames,
      userType,
      disabled, // Correctly using `disabled` instead of `enabled`
    } = req.body;

    const isSelfUpdate = req.authUser.id === req.params.id;

    // Role-based access control
    if (req.authUser.userType === 'Customer' && !isSelfUpdate) {
      return res
        .status(403)
        .json({ error: 'Customers can only modify their own account' });
    }

    if (
      req.authUser.userType === 'Librarian' &&
      !isSelfUpdate &&
      req.targetUser.userType !== 'Customer'
    ) {
      return res
        .status(403)
        .json({ error: 'Librarians can only modify their own account or Customers' });
    }

    if (req.authUser.userType !== 'Admin' && req.authUser.disabled) {
      return res
        .status(403)
        .json({ error: 'Your account is disabled and cannot be modified' });
    }

    const changes = [];

    // Update the username if different from current username
    if (username && req.targetUser.username !== username) {
      req.targetUser.username = username;
      changes.push('Username updated');
    }

    // Update the password if provided and different from the current value
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          error: 'Password must be at least 8 characters long',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      if (req.targetUser.password !== hashedPassword) {
        req.targetUser.password = hashedPassword;
        changes.push('Password updated');
      }
    }

    // Update firstname if provided
    if (firstname) {
      req.targetUser.firstname = firstname;
      changes.push('First name updated');
    }

    // Update lastname if provided
    if (lastname) {
      req.targetUser.lastname = lastname;
      changes.push('Last name updated');
    }

    // Update otherNames if provided
    if (otherNames) {
      req.targetUser.otherNames = otherNames;
      changes.push('Other names updated');
    }

    // Update userType based on role permissions
    if (userType) {
      if (req.authUser.userType === 'Admin') {
        if (!['Customer', 'Librarian', 'Admin'].includes(userType)) {
          return res.status(400).json({ error: 'Invalid userType value' });
        }
        req.targetUser.userType = userType;
        changes.push('User type updated');
      } else if (req.authUser.userType === 'Librarian') {
        if (req.targetUser.userType !== 'Customer' || userType !== 'Librarian') {
          return res.status(403).json({
            error: 'Librarians can only update Customers to Librarian',
          });
        }
        req.targetUser.userType = userType;
        changes.push('User type updated');
      } else {
        return res
          .status(403)
          .json({ error: 'You do not have permission to update userType' });
      }
    }

    // Update disabled status
    if (disabled !== undefined) {
      if (req.authUser.userType !== 'Admin') {
        return res
          .status(403)
          .json({ error: 'Only administrators can disable or enable users' });
      }

      if (typeof disabled !== 'boolean') {
        return res.status(400).json({ error: 'Disabled must be a boolean value' });
      }

      if (req.targetUser.disabled !== disabled) {
        req.targetUser.disabled = disabled;
        changes.push(`User ${disabled ? 'disabled' : 'enabled'}`);
      }
    }

    // Save the changes
    await req.targetUser.save();

    const message =
      changes.length > 0 ? changes.join(', ') : 'No changes were made';

    res.json({
      message,
      user: { id: req.targetUser.id, username: req.targetUser.username },
    });
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
