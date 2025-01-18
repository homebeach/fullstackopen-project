const request = require('supertest');
const express = require('express');
const { Session } = require('../models');
const logoutRouter = require('../controllers/logout');
const tokenExtractor = require('../middleware/tokenExtractor');

// Mock dependencies
jest.mock('../models', () => ({
  Session: {
    destroy: jest.fn(),
  },
}));

jest.mock('../middleware/tokenExtractor', () => jest.fn((req, res, next) => {
  req.token = 'mockToken';
  next();
}));

const app = express();
app.use(express.json());
app.use('/api/logout', logoutRouter);

describe('DELETE /api/logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log out successfully with a valid token', async () => {
    Session.destroy.mockResolvedValue(1); // Simulate successful deletion

    const response = await request(app).delete('/api/logout');

    expect(tokenExtractor).toHaveBeenCalled(); // Ensure middleware was called
    expect(Session.destroy).toHaveBeenCalledWith({ where: { token: 'mockToken' } });
    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it('should handle database errors gracefully', async () => {
    Session.destroy.mockRejectedValue(new Error('Database error')); // Simulate database failure

    const response = await request(app).delete('/api/logout');

    expect(tokenExtractor).toHaveBeenCalled(); // Ensure middleware was called
    expect(Session.destroy).toHaveBeenCalledWith({ where: { token: 'mockToken' } });
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Something went wrong while logging out' });
  });

  it('should return 500 if tokenExtractor fails', async () => {
    tokenExtractor.mockImplementationOnce((req, res, next) => {
      next(new Error('Token extraction failed'));
    });

    const response = await request(app).delete('/api/logout');

    expect(tokenExtractor).toHaveBeenCalled(); // Ensure middleware was called
    expect(response.status).toBe(500);
  });
});
