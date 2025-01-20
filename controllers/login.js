const { Sequelize } = require('sequelize');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../util/config');
const { User, Session, BorrowedItem } = require('../models');

const router = express.Router();

router.post('/', async (request, response, next) => {
  const { username, password } = request.body;

  try {
    // Find the user by username
    const user = await User.findOne({ where: { username } });

    if (!user) {
      const error = new Error('Invalid username or password');
      error.name = 'AuthenticationError'; // Set error name for 401
      error.status = 401;
      throw error;
    }

    // Compare the provided password with the hashed password in the database
    const passwordCorrect = await bcrypt.compare(password, user.password);

    if (!passwordCorrect) {
      const error = new Error('Invalid username or password');
      error.name = 'AuthenticationError'; // Set error name for 401
      error.status = 401;
      throw error;
    }

    if (user.disabled) {
      const error = new Error('User is disabled');
      error.status = 403; // Custom status for this error
      throw error;
    }

    // Invalidate existing sessions if necessary
    const existingSession = await Session.findOne({ where: { userId: user.id } });
    if (existingSession) {
      await existingSession.destroy(); // Remove old session before creating a new one
    }

    // Generate a new token
    const userForToken = { username: user.username, id: user.id };
    const token = jwt.sign(userForToken, SECRET);

    // Log the session into the sessions table
    await Session.create({ userId: user.id, token });

    // Fetch borrowed item IDs for the user
    const borrowedItems = await BorrowedItem.findAll({
      where: { userId: user.id },
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('library_item_id')), 'library_item_id']],
      raw: true,
    });

    const borrowedItemIds = borrowedItems.map((item) => item.library_item_id);

    response.status(200).send({
      token,
      userId: user.id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      userType: user.userType,
      borrowedItems: borrowedItemIds,
    });
  } catch (error) {
    next(error); // Pass error to the errorHandler middleware
  }
});

module.exports = router;
