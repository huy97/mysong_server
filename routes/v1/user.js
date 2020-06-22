'use strict';
const express = require('express');
const router = express.Router();
const authenticationMiddleware = require('../../middleware/authenticated');
const {can} = require('../../middleware/checkPermission');
const {PERMISSION_CODE} = require('../../utils/constant');
const userValidation = require('../../middleware/validation/user');
const userController = require('../../controllers/userController');

router.get('/get-user-info', authenticationMiddleware, userController.getUserInfo);
router.post('/login', userValidation.createUserValidation, userController.login);
router.post('/register', userValidation.createUserValidation, userController.register);
router.post('/create-user', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER]), userValidation.createUserValidation], userController.register);
router.put('/:userId', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER, PERMISSION_CODE.UPDATE]), userValidation.updateUserValidation], userController.updateUser);
router.delete('/:userId', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER])], userController.deleteUser);
router.put('/:userId/change-password', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER, PERMISSION_CODE.UPDATE]), userValidation.updateUserPasswordValidation], userController.changePassword);
router.put('/:userId/logout', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER, PERMISSION_CODE.UPDATE])], userController.logout);
router.put('/:userId/roles', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER])], userController.updateUserRoles);
router.get('/get-liked-songs', authenticationMiddleware, userController.getLikedSongs);
router.get('/get-my-songs', authenticationMiddleware, userController.getMySongs);
router.get('/get-followed-artists', authenticationMiddleware, userController.getFollowedArtists);
router.get('/get-list-user', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER])], userController.getListUser);
router.get('/get-list-permissions', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER])], userController.getPermissions);
router.get('/get-list-roles', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER])], userController.getListRoles);
router.post('/role/create', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER])], userController.createRole);
router.put('/role/:roleId', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER])], userController.updateRole);
router.delete('/role/:roleId', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER])], userController.deleteRole);


module.exports = router;
