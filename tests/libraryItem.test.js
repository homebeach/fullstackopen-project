const request = require('supertest');
const express = require('express');
const libraryRouter = require('../controllers/libraryItem');
const { LibraryItem, BorrowedItem } = require('../models');
const tokenExtractor = require('../middleware/tokenExtractor');
const roleChecker = require('../middleware/roleChecker');

// Mock Express App
const app = express();
app.use(express.json());
app.use('/api/library', libraryRouter);

// Mock the models and middleware
jest.mock('../models', () => ({
  LibraryItem: {
    findAll: jest.fn(),
    bulkCreate: jest.fn(),
  },
  BorrowedItem: {
    findAll: jest.fn(),
  },
}));
jest.mock('../middleware/tokenExtractor', () => jest.fn((req, res, next) => {
  req.authUser = { id: 1, userType: 'User' };
  next();
}));
jest.mock('../middleware/roleChecker', () => jest.fn(() => (req, res, next) => {
  if (req.authUser.userType !== 'Admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}));

// Define tests
describe('LibraryItem Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock LibraryItem.findAll response
    LibraryItem.findAll.mockResolvedValue([
      {
        id: 1,
        title: 'Book A',
        author: 'Author A',
        publishedDate: '2023-01-01',
        genre: 'Fiction',
        type: 'Book',
        copiesAvailable: 5,
      },
    ]);

    // Mock BorrowedItem.findAll response
    BorrowedItem.findAll.mockResolvedValue([
      {
        libraryItem: {
          id: 1,
          title: 'Book A',
          author: 'Author A',
          genre: 'Fiction',
          type: 'Book',
          publishedDate: '2023-01-01',
        },
      },
    ]);

    // Mock LibraryItem.bulkCreate response
    LibraryItem.bulkCreate.mockResolvedValue([
      { id: 1, title: 'Book A', author: 'Author A', publishedDate: '2023-01-01', genre: 'Fiction', type: 'Book' },
    ]);
  });

  it('should return all library items with computed copiesAvailable', async () => {
    const res = await request(app).get('/api/library');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      {
        id: 1,
        title: 'Book A',
        author: 'Author A',
        publishedDate: '2023-01-01',
        genre: 'Fiction',
        type: 'Book',
        copiesAvailable: 5,
      },
    ]);
  });

  it('should return borrowed library items for the logged-in user', async () => {
    const res = await request(app).get('/api/library/borrowed');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      {
        id: 1,
        title: 'Book A',
        author: 'Author A',
        genre: 'Fiction',
        type: 'Book',
        publishedDate: '2023-01-01',
      },
    ]);
  });

it('should allow librarians or admins to add new items', async () => {
  // Mock the tokenExtractor for this test
  tokenExtractor.mockImplementationOnce((req, res, next) => {
    req.authUser = { id: 1, userType: 'Admin' }; // Simulate admin user
    next(); // Proceed to the next middleware
  });

  // Mock roleChecker for this test
  roleChecker.mockImplementationOnce(() => (req, res, next) => {
    if (req.authUser.userType !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  });

  // Sample new items to add
  const newItems = [
    { title: 'Book B', author: 'Author B', publishedDate: '2023-01-01', genre: 'Non-Fiction', type: 'Book' },
  ];

  // Call the POST endpoint to add new items
  const res = await request(app).post('/api/library').send(newItems);

  // Assert the response
  expect(res.statusCode).toBe(201); // Ensure the status code is 201 for successful creation
  expect(LibraryItem.bulkCreate).toHaveBeenCalledWith(newItems, { validate: true });
  expect(res.body).toEqual([
    { id: 1, title: 'Book A', author: 'Author A', publishedDate: '2023-01-01', genre: 'Fiction', type: 'Book' },
  ]);
});



  it('should reject non-librarian/admin users', async () => {
    const newItems = [
      { title: 'Book B', author: 'Author B', publishedDate: '2023-01-01', genre: 'Non-Fiction', type: 'Book' },
    ];

    const res = await request(app).post('/api/library').send(newItems);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: 'Access denied' });
  });

  it('should handle database errors gracefully', async () => {
    LibraryItem.findAll.mockRejectedValue(new Error('Database error'));

    const res = await request(app).get('/api/library');

    expect(res.statusCode).toBe(500);
  });
});
