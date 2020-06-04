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
router.get('/get-liked-songs', authenticationMiddleware, userController.getLikedSongs);
router.get('/get-followed-artists', authenticationMiddleware, userController.getFollowedArtists);

module.exports = router;
