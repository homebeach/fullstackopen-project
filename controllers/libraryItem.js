// routes/libraryItem.js
const express = require('express');
const { LibraryItem, BorrowedItem } = require('../models');
const tokenExtractor = require('../middleware/tokenExtractor');
const roleChecker = require('../middleware/roleChecker'); // Middleware for role-based access
const router = express.Router();

// Middleware to check if the user is logged in and has the correct role
router.use(tokenExtractor);

// GET /api/library: Query all items in the library
router.get('/', async (req, res, next) => {
  try {
    const items = await LibraryItem.findAll();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

router.get('/borrowed', tokenExtractor, async (req, res, next) => {
  try {
    const userId = req.user.id; // Extract user ID from the token

    const borrowedItems = await BorrowedItem.findAll({
      where: {
        userId, // Match user ID
        returnDate: null, // Items not yet returned
      },
      include: [
        {
          model: LibraryItem, // Join with LibraryItem
          attributes: ['id', 'title', 'author', 'genre', 'type', 'publishedDate'], // Select desired fields
        },
      ],
    });

    // Extract LibraryItem details, remove duplicates by id, and sort by id
    const libraryItems = borrowedItems
      .map((borrowed) => borrowed.libraryItem)
      .filter((item, index, self) =>
        index === self.findIndex((t) => t.id === item.id) // Remove duplicates by id
      )
      .sort((a, b) => a.id - b.id); // Sort by id in ascending order

    res.status(200).json(libraryItems);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

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
