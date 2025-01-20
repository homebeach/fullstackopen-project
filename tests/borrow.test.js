const request = require('supertest');
const express = require('express');
const { LibraryItem, BorrowedItem } = require('../models');
const borrowRouter = require('../controllers/borrowItem');
const tokenExtractor = require('../middleware/tokenExtractor');
const errorHandler = require('../middleware/errorHandler');

// Mock dependencies
jest.mock('../models', () => ({
  LibraryItem: {
    findByPk: jest.fn(),
  },
  BorrowedItem: {
    count: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  },
}));

jest.mock('../middleware/tokenExtractor', () =>
  jest.fn((req, res, next) => {
    req.authUser = { id: 1 }; // Mock user
    next();
  })
);

const app = express();
app.use(express.json());
app.use('/api/library', borrowRouter);
app.use(errorHandler);

describe('Borrow and Return Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /:id/borrow', () => {
    it('should borrow an item successfully', async () => {
      LibraryItem.findByPk.mockResolvedValue({ id: 1, copiesAvailable: 5 });
      BorrowedItem.count.mockResolvedValue(2); // 2 items already borrowed
      BorrowedItem.create.mockResolvedValue();

      const response = await request(app).post('/api/library/1/borrow');

      expect(tokenExtractor).toHaveBeenCalled();
      expect(LibraryItem.findByPk).toHaveBeenCalledWith('1');
      expect(BorrowedItem.count).toHaveBeenCalledWith({
        where: { libraryItemId: '1', returnDate: null },
      });
      expect(BorrowedItem.create).toHaveBeenCalledWith({
        userId: 1,
        libraryItemId: '1',
      });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Item borrowed successfully' });
    });

    it('should return 404 if library item is not found', async () => {
      LibraryItem.findByPk.mockResolvedValue(null);

      const response = await request(app).post('/api/library/1/borrow');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Library item not found' });
    });

    it('should return 400 if no copies are available', async () => {
      LibraryItem.findByPk.mockResolvedValue({ id: 1, copiesAvailable: 2 });
      BorrowedItem.count.mockResolvedValue(2); // All copies are borrowed

      const response = await request(app).post('/api/library/1/borrow');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'No copies available for borrowing' });
    });
  });

  describe('POST /:id/return', () => {
    it('should return an item successfully', async () => {
      const borrowedItemMock = { save: jest.fn() }; // Mock the borrowed item instance
      BorrowedItem.findOne.mockResolvedValue(borrowedItemMock);

      const response = await request(app).post('/api/library/1/return');

      expect(tokenExtractor).toHaveBeenCalled();
      expect(BorrowedItem.findOne).toHaveBeenCalledWith({
        where: { userId: 1, libraryItemId: '1', returnDate: null },
      });
      expect(borrowedItemMock.save).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Item returned successfully' });
    });

    it('should return 404 if borrowed item is not found', async () => {
      BorrowedItem.findOne.mockResolvedValue(null);

      const response = await request(app).post('/api/library/1/return');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Borrowed item not found or already returned',
      });
    });
  });
});
