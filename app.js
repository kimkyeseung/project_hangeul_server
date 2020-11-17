const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const index = require('./routes/index');

const app = express();
mongoose.connect(`mongodb://admin:${process.env.MONGO_MLAB_DATABASE}@ds263590.mlab.com:63590/project_hangeul`, { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
const db = mongoose.connection;

db.once('open', () => {
  console.log('database connected');
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', index);

app.use(function (err, req, res, next) {
  res.status(err.status).json({
    message: err.message
  });
});

module.exports = app;
