require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();

const { PORT } = require('./util/config');
const { connectToDatabase } = require('./util/db');

const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const logoutRouter = require('./controllers/logout');
const libraryRouter = require('./controllers/libraryItem');
const borrowItemRouter = require('./controllers/borrowItem');

const errorHandler = require('./middleware/errorHandler');

app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/logout', logoutRouter);
app.use('/api/library', libraryRouter);
app.use('/api/borrowItem', borrowItemRouter);

app.use(errorHandler);

// Start the application
const start = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
