'use strict';
require('dotenv').config();
const rateLimit = require("express-rate-limit");
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const maintenanceMode = require('./middleware/maintenance');
const v1Router = require('./routes/v1');
const cdnRouter = require('./routes/cdn');

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Hệ thống bận, vui lòng quay lại sau"
});

app.use(helmet());
// app.use(limiter);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('tiny'));
app.use(maintenanceMode(process.env.NODE_ENV));
app.use('/api/v1', v1Router);
app.use('/cdn', cdnRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json({
    status: 404,
    message: 'Trang không tồn tại.'
  });
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message
  });
});

if(process.env.NODE_ENV === 'production'){
  mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`, {
    auth: {
      user: process.env.DB_USER,
      pass: process.env.DB_PASS
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  });
}else{
  mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  });
}

module.exports = app;
