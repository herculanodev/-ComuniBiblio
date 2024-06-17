const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const apidocsRouter = require('./routes/book');
const booksRouter = require('./routes/book');
const usersRouter = require('./routes/users');

dotenv.config();

mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });

const app = express();

app.use(express.json());
app.use('/api-docs', apidocsRouter);
app.use('/books', booksRouter);
app.use('/users', usersRouter);

module.exports = app;
