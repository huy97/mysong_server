'use strict';
const express = require('express');
const router = express.Router();
const authenticationMiddleware = require('../../middleware/authenticated');
const {can} = require('../../middleware/checkPermission');
const {PERMISSION_CODE} = require('../../utils/constant');
const songValidation = require('../../middleware/validation/song');
const songController = require('../../controllers/songController');

router.post('/create', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER, PERMISSION_CODE.CREATE, PERMISSION_CODE.UPDATE, PERMISSION_CODE.DELETE]), songValidation.createNewSongValidation], songController.createNewSong);
router.get('/get-song-info', songController.getSongInfo);
router.get('/get-list-songs', songController.getListSong);
router.put('/:songId', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER, PERMISSION_CODE.UPDATE]), songValidation.updateSongValidation], songController.updateSong);
router.delete('/:songId', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER, PERMISSION_CODE.DELETE])], songController.deleteSong);
router.get('/:songId/comments', songController.getSongComments);
router.get('/:songId/lyrics', songController.getSongLyrics);
router.post('/:songId/like', [authenticationMiddleware], songController.likeDislikeSong);
router.post('/lyric/create', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER, PERMISSION_CODE.CREATE]), songValidation.createSongLyricValidation], songController.createSongLyric);
router.put('/lyric/:lyricId', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER, PERMISSION_CODE.UPDATE]), songValidation.updateSongLyricValidation], songController.updateSongLyric);
router.delete('/lyric/:lyricId', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER, PERMISSION_CODE.DELETE]), songValidation.updateSongLyricValidation], songController.deleteSongLyric);
router.post('/comment/create', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER, PERMISSION_CODE.CREATE]), songValidation.createSongLyricValidation], songController.createSongComment);
router.delete('/comment/:commentId', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER, PERMISSION_CODE.DELETE]), songValidation.createSongCommentValidation], songController.deleteSongComment);

module.exports = router;
