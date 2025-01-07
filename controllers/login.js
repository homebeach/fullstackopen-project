const { Sequelize } = require('sequelize');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../util/config');
const { User, Session, BorrowedItem } = require('../models');

const router = express.Router();

router.post('/', async (request, response) => {
  const { username, password } = request.body;

  try {
    // Find the user by username
    const user = await User.findOne({
      where: { username },
    });

    if (!user) {
      return response.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare the provided password with the hashed password in the database
    const passwordCorrect = await bcrypt.compare(password, user.password);

    if (!passwordCorrect) {
      return response.status(401).json({ error: 'Invalid username or password' });
    }

    // Check if the user is disabled
    if (user.disabled) {
      return response.status(403).json({ error: 'User is disabled' });
    }

    // Invalidate existing sessions if necessary
    const existingSession = await Session.findOne({ where: { userId: user.id } });
    if (existingSession) {
      await existingSession.destroy(); // Remove old session before creating a new one
    }

    // Generate a new token
    const userForToken = {
      username: user.username,
      id: user.id,
    };

    const token = jwt.sign(userForToken, SECRET);

    // Log the session into the sessions table
    await Session.create({
      userId: user.id,
      token,
    });

    // Fetch borrowed item IDs for the user
    const borrowedItems = await BorrowedItem.findAll({
      where: { userId: user.id },
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('library_item_id')), 'library_item_id']
      ], // Fetch distinct library_item_id values
      raw: true, // Return plain object results
    });

    const borrowedItemIds = borrowedItems.map((item) => item.library_item_id);

    response.status(200).send({
      token,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      borrowedItems: borrowedItemIds, // Include borrowed item IDs in the response
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
