const errorHandler = (error, req, res, next) => {
  // Handle validation errors from Sequelize
  if (error.name === 'SequelizeValidationError') {
    const messages = error.errors.map(e => e.message);
    return res.status(400).json({ error: 'Validation error', details: messages });
  }

  // Handle unique constraint errors from Sequelize
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ error: 'Unique constraint error', details: error.errors.map(e => e.message) });
  }

  // Handle authentication errors
  if (error.name === 'AuthenticationError') {
    return res.status(error.status || 401).json({ error: error.message || 'Unauthorized' });
  }

  // Handle "not found" errors
  if (error.name === 'NotFoundError') {
    return res.status(error.status || 404).json({ error: error.message || 'Not found' });
  }

  // Handle custom "user disabled" errors
  if (error.status === 403) {
    return res.status(403).json({ error: error.message || 'Forbidden' });
  }

  // Handle general database errors
  if (
    error.name === 'SequelizeDatabaseError' ||
    error.name === 'DatabaseError' ||
    (error.message && error.message.includes('Database error'))
  ) {
    return res.status(500).json({ error: 'Database error' });
  }

  // Handle all other errors
  return res.status(500).json({ error: 'Internal Server Error' });
};

module.exports = errorHandler;
