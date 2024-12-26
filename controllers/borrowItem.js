const express = require('express');
const router = express.Router();
const { LibraryItem, BorrowedItem, User } = require('../models');
const tokenExtractor = require('../middleware/tokenExtractor');

// Borrow an item
router.post('/:id/borrow', tokenExtractor, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const libraryItemId = req.params.id;

    const libraryItem = await LibraryItem.findByPk(libraryItemId);
    if (!libraryItem) {
      return res.status(404).json({ error: 'Library item not found' });
    }

    if (libraryItem.copiesAvailable < 1) {
      return res.status(400).json({ error: 'No copies available for borrowing' });
    }

    // Create a BorrowedItem record
    await BorrowedItem.create({
      userId,
      libraryItemId,
    });

    // Decrement the copiesAvailable count
    libraryItem.copiesAvailable -= 1;
    await libraryItem.save();

    res.status(200).json({ message: 'Item borrowed successfully' });
  } catch (error) {
    next(error);
  }
});

// Return an item
router.post('/:id/return', tokenExtractor, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const libraryItemId = req.params.id;

    const borrowedItem = await BorrowedItem.findOne({
      where: { userId, libraryItemId, returnDate: null },
    });

    if (!borrowedItem) {
      return res.status(404).json({ error: 'Borrowed item not found' });
    }

    // Update the returnDate
    borrowedItem.returnDate = new Date();
    await borrowedItem.save();

    // Increment the copiesAvailable count
    const libraryItem = await LibraryItem.findByPk(libraryItemId);
    libraryItem.copiesAvailable += 1;
    await libraryItem.save();

    res.status(200).json({ message: 'Item returned successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
