// routes/libraryItem.js
const express = require('express');
const { LibraryItem } = require('../models');
const tokenExtractor = require('../middleware/tokenExtractor');
const roleChecker = require('../middleware/roleChecker'); // Middleware for role-based access
const router = express.Router();
const cors = require('cors');
const app = express();

// Enable CORS for all origins
app.use(cors());

// GET /api/library: Query all items in the library
router.get('/', async (req, res, next) => {
  try {
    const items = await LibraryItem.findAll();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// Middleware to check if the user is logged in and has the correct role
router.use(tokenExtractor);

// POST /api/libraryItems: Add new items (restricted to librarians or admins)
router.post('/', roleChecker(['Librarian', 'Admin']), async (req, res, next) => {
  try {
    const libraryItems = req.body;

    if (!Array.isArray(libraryItems) || libraryItems.length === 0) {
      return res.status(400).json({ error: 'Request body must be a non-empty array of library items' });
    }

    const invalidItems = libraryItems.filter(item =>
      !item.title || !item.author || !item.publishedDate || !item.genre || !item.type
    );

    if (invalidItems.length > 0) {
      return res.status(400).json({
        error: 'Each item must have title, author, published date, genre, and type',
        invalidItems,
      });
    }

    const newItems = await LibraryItem.bulkCreate(libraryItems, { validate: true });
    res.status(201).json(newItems);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
