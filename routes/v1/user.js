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
router.put('/:userId', [authenticationMiddleware, can([PERMISSION_CODE.UPDATE]), validationMiddleware.updateUserValidation], userController.updateUser);
router.put('/:userId/change-password', [authenticationMiddleware, can([PERMISSION_CODE.UPDATE]), validationMiddleware.updateUserPasswordValidation], userController.changePassword);
router.put('/:userId/logout', [authenticationMiddleware, can([PERMISSION_CODE.UPDATE])], userController.logoutAllDevice);
router.get('/get-liked-songs', authenticationMiddleware, userController.getLikedSongs);
router.get('/get-followed-artists', authenticationMiddleware, userController.getFollowedArtists);
router.post('/get-list-user', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER])], userController.getListUser);
router.post('/roles/create', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER])], userController.getFollowedArtists);

module.exports = router;
