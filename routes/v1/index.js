'use strict';
const express = require('express');
const router = express.Router();
const userRouter = require('./user');
const songRouter = require('./song');
const mediaRouter = require('./media');
const artistRouter = require('./artist');
const categoryRouter = require('./category');

router.use('/user', userRouter);
router.use('/song', songRouter);
router.use('/media', mediaRouter);
router.use('/artist', artistRouter);
router.use('/category', categoryRouter);

module.exports = router;
