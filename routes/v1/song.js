'use strict';
const express = require('express');
const router = express.Router();
const authenticationMiddleware = require('../../middleware/authenticated');
const {can} = require('../../middleware/checkPermission');
const {PERMISSION_CODE} = require('../../utils/constant');
const validationMiddleware = require('../../middleware/validation');
const songController = require('../../controllers/songController');

router.post('/create', [authenticationMiddleware, can([PERMISSION_CODE.CREATE, PERMISSION_CODE.UPDATE, PERMISSION_CODE.DELETE]), validationMiddleware.createNewSongValidation], songController.createNewSong);
router.post('/get-song-info', songController.getSongInfo);
router.post('/get-list-song', songController.getListSong);
router.post('/get-song-comments', songController.getListSong);
router.put('/:songId', [authenticationMiddleware, can([PERMISSION_CODE.UPDATE])], songController.updateSong);
router.delete('/:songId', [authenticationMiddleware, can([PERMISSION_CODE.DELETE])], songController.deleteSong);

module.exports = router;
