// routes/libraryItem.js
const express = require('express');
const { LibraryItem } = require('../models');
const tokenExtractor = require('../middleware/tokenExtractor');
const roleChecker = require('../middleware/roleChecker'); // Middleware for role-based access
const router = express.Router();

// Middleware to check if the user is logged in and has the correct role
router.use(tokenExtractor);

// GET /api/libraryItems: Query all items in the library
router.get('/', async (req, res, next) => {
  try {
    const items = await LibraryItem.findAll();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// POST /api/libraryItems: Add a new library item (only for librarians or admins)
router.post('/', roleChecker(['librarian', 'admin']), async (req, res, next) => {
  try {
    const { title, authorOrArtist, publishedDate, genre, type } = req.body;

    // Validation
    if (!title || !authorOrArtist || !publishedDate || !genre || !type) {
      return res.status(400).json({
        error: 'Title, author/artist, published date, genre, and type are required',
      });
    }

    // Create the new LibraryItem
    const newItem = await LibraryItem.create({
      title,
      authorOrArtist,
      publishedDate,
      genre,
      type,
    });

    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
