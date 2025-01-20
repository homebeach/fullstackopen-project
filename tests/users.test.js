const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const usersRouter = require('../controllers/users');
const tokenExtractor = require('../middleware/tokenExtractor');
const errorHandler = require('../middleware/errorHandler');

// Mock dependencies
jest.mock('../models', () => ({
  User: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));
jest.mock('../middleware/tokenExtractor', () =>
  jest.fn((req, res, next) => {
    req.authUser = { id: 1, userType: 'Admin' }; // Mock authenticated user
    next();
  })
);

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);
app.use(errorHandler); // Add the error handler middleware here

describe('Users Router', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear previous mocks
    // Set default mock implementation for tokenExtractor
    tokenExtractor.mockImplementation((req, res, next) => {
      req.authUser = { id: 1, userType: 'Admin' }; // Default mock user type (Admin)
      next();
    });
  });

  describe('GET /api/users', () => {
    it('should retrieve all users successfully', async () => {
      User.findAll.mockResolvedValue([
        { id: 1, username: 'john_doe', firstname: 'John', lastname: 'Doe' },
      ]);

      const response = await request(app).get('/api/users');

      expect(User.findAll).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { id: 1, username: 'john_doe', firstname: 'John', lastname: 'Doe' },
      ]);
    });

    it('should handle database errors', async () => {
      User.findAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('GET /api/users/:id', () => {
    it('should retrieve a user by ID successfully', async () => {
      User.findByPk.mockResolvedValue({
        id: 1,
        username: 'john_doe',
        firstname: 'John',
        lastname: 'Doe',
      });

      const response = await request(app).get('/api/users/1');

      expect(User.findByPk).toHaveBeenCalledWith('1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        username: 'john_doe',
        firstname: 'John',
        lastname: 'Doe',
      });
    });

    it('should return 404 if user is not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const response = await request(app).get('/api/users/1');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found' });
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user successfully', async () => {
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({
        id: 1,
        username: 'new_user',
        firstname: 'New',
        lastname: 'User',
        userType: 'Customer',
      });

      const response = await request(app).post('/api/users').send({
        username: 'new_user',
        firstname: 'New',
        lastname: 'User',
        password: 'password123',
      });

      expect(User.create).toHaveBeenCalledWith({
        username: 'new_user',
        firstname: 'New',
        lastname: 'User',
        userType: 'Customer',
        password: 'hashedPassword',
      });
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: 1,
        username: 'new_user',
        firstname: 'New',
        lastname: 'User',
        userType: 'Customer',
      });
    });

    it('should handle missing required fields', async () => {
      const response = await request(app).post('/api/users').send({
        username: 'new_user',
        firstname: 'New',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Username, firstname, lastname, and password are required',
      });
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a user successfully', async () => {
      const mockUser = {
        save: jest.fn(),
        id: 1,
        username: 'old_user',
        firstname: 'Old',
        lastname: 'User',
        userType: 'Customer',
      };
      User.findByPk.mockResolvedValue(mockUser);

      const response = await request(app).put('/api/users/1').send({
        username: 'updated_user',
      });

      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.username).toBe('updated_user');
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Username updated');
    });

    it('should handle unauthorized updates', async () => {
      // Mock tokenExtractor for this specific test to simulate a Customer user
      tokenExtractor.mockImplementation((req, res, next) => {
        req.authUser = { id: 2, userType: 'Customer' };
        next();
      });

      const mockUser = {
        save: jest.fn(),
        id: 2,
        username: 'other_user',
        firstname: 'Other',
        lastname: 'User',
        userType: 'Admin', // The user to update is an Admin
      };

      // Mock the user lookup
      User.findByPk.mockResolvedValue(mockUser);

      // Make the request to update the user
      const response = await request(app).put('/api/users/2').send({
        username: 'unauthorized_update',
      });

      // Check that the response status is 403 (forbidden)
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Customers can only modify their own account');
    });
  });


  describe('DELETE /api/users/:id', () => {
    it('should delete a user successfully as Admin', async () => {
      const mockUser = { destroy: jest.fn() };
      User.findByPk.mockResolvedValue(mockUser);

      const response = await request(app).delete('/api/users/1');

      expect(mockUser.destroy).toHaveBeenCalled();
      expect(response.status).toBe(204);
    });

    it('should return 403 for unauthorized delete attempts', async () => {
      tokenExtractor.mockImplementation((req, res, next) => {
        req.authUser = { id: 2, userType: 'Customer' };
        next();
      });

      const response = await request(app).delete('/api/users/1');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('You do not have permission to delete this user');
    });
  });
});
