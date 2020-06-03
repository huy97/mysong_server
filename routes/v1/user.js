'use strict';
const express = require('express');
const router = express.Router();
const authenticationMiddleware = require('../../middleware/authenticated');
const {can} = require('../../middleware/checkPermission');
const {PERMISSION_CODE} = require('../../utils/constant');
const validationMiddleware = require('../../middleware/validation');
const userController = require('../../controllers/userController');

router.get('/get-user-info', authenticationMiddleware, userController.getUserInfo);
router.post('/login', validationMiddleware.createUserValidation, userController.login);
router.post('/register', validationMiddleware.createUserValidation, userController.register);
router.get('/get-songs-liked', authenticationMiddleware, userController.getSongsLiked);

module.exports = router;
