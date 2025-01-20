const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Session, BorrowedItem } = require('../models');
const loginRouter = require('../controllers/login');
const { SECRET } = require('../util/config');
const errorHandler = require('../middleware/errorHandler');

jest.mock('../models', () => ({
  User: {
    findOne: jest.fn(),
  },
  Session: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  BorrowedItem: {
    findAll: jest.fn(),
  },
}));

jest.mock('sequelize', () => ({
  Sequelize: {
    fn: jest.fn(() => 'mockFn'),
    col: jest.fn(() => 'mockCol'),
  },
}));

// Add this in the specific test throwing an error
User.findOne.mockRejectedValue(new Error('Database error'));
jest.mock('jsonwebtoken'); // Mock JWT for consistent token generation

const app = express();
app.use(express.json());
app.use('/api/login', loginRouter);
app.use(errorHandler);

describe('POST /api/login', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should log in a user with valid credentials', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10); // Wait for bcrypt.hash to resolve

    const mockUser = {
      id: 1,
      username: 'testuser',
      password: hashedPassword, // Hashed password
      firstname: 'Test',
      lastname: 'User',
      userType: 'member',
      disabled: false,
    };

    User.findOne.mockResolvedValue(mockUser);
    Session.findOne.mockResolvedValue(null); // No existing session
    Session.create.mockResolvedValue();
    BorrowedItem.findAll.mockResolvedValue([
      { library_item_id: 1 },
      { library_item_id: 2 },
    ]);

    jwt.sign.mockReturnValue('mockToken');

    const response = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      token: 'mockToken',
      userId: mockUser.id,
      username: mockUser.username,
      firstname: mockUser.firstname,
      lastname: mockUser.lastname,
      userType: mockUser.userType,
      borrowedItems: [1, 2],
    });
  });

  it('should return 401 if username is invalid', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/login')
      .send({ username: 'invaliduser', password: 'password123' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Invalid username or password' });
  });

  it('should return 401 if password is incorrect', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      password: await bcrypt.hash('password123', 10), // Correct password
      disabled: false,
    };

    User.findOne.mockResolvedValue(mockUser);

    const response = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Invalid username or password' });
  });

  it('should return 403 if user is disabled', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      password: await bcrypt.hash('password123', 10),
      disabled: true,
    };

    User.findOne.mockResolvedValue(mockUser);

    const response = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'password123' });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: 'User is disabled' });
  });

  it('should handle server errors gracefully', async () => {
    User.findOne.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'password123' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Database error' });
  });

});
