const express = require('express');
const router = express.Router();
const { LibraryItem, BorrowedItem, User } = require('../models');
const tokenExtractor = require('../middleware/tokenExtractor');

router.post('/:id/borrow', tokenExtractor, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const libraryItemId = req.params.id;

    const libraryItem = await LibraryItem.findByPk(libraryItemId);
    if (!libraryItem) {
      return res.status(404).json({ error: 'Library item not found' });
    }

    // Count active borrow records for this item
    const activeBorrowCount = await BorrowedItem.count({
      where: {
        libraryItemId,
        returnDate: null, // Ensure we count only items not yet returned
      },
    });

    if (activeBorrowCount >= libraryItem.copiesAvailable) {
      return res.status(400).json({ error: 'No copies available for borrowing' });
    }

    // Create a BorrowedItem record
    await BorrowedItem.create({
      userId,
      libraryItemId,
    });

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

    // Find the borrowed item entry
    const borrowedItem = await BorrowedItem.findOne({
      where: { userId, libraryItemId, returnDate: null }, // Only find items not yet returned
    });

    if (!borrowedItem) {
      return res.status(404).json({ error: 'Borrowed item not found or already returned' });
    }

    // Update the returnDate
    borrowedItem.returnDate = new Date();
    await borrowedItem.save();

    res.status(200).json({ message: 'Item returned successfully' });
  } catch (error) {
    next(error);
  }
});


module.exports = router;
