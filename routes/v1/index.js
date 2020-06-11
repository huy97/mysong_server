'use strict';
const express = require('express');
const router = express.Router();
const userRouter = require('./user');
const songRouter = require('./song');
const mediaRouter = require('./media');
const managerRouter = require('./manager');

router.use('/user', userRouter);
router.use('/song', songRouter);
router.use('/media', mediaRouter);
router.use('/manager', managerRouter);

module.exports = router;
