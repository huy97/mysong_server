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
router.post('/get-song-info', songController.getSongInfo);
router.post('/get-list-song', songController.getListSong);
router.put('/:songId', [authenticationMiddleware, can([PERMISSION_CODE.UPDATE]), validationMiddleware.updateSongValidation], songController.updateSong);
router.delete('/:songId', [authenticationMiddleware, can([PERMISSION_CODE.DELETE])], songController.deleteSong);
router.get('/:songId/comments', songController.getSongComments);
router.get('/:songId/lyrics', songController.getSongLyrics);
router.post('/:songId/like', [authenticationMiddleware], songController.likeSong);
router.post('/:songId/dislike', [authenticationMiddleware], songController.dislikeSong);
router.post('/lyric/create', [authenticationMiddleware, can([PERMISSION_CODE.CREATE]), validationMiddleware.createSongLyricValidation], songController.createSongLyric);
router.put('/lyric/:lyricId', [authenticationMiddleware, can([PERMISSION_CODE.UPDATE]), validationMiddleware.updateSongLyricValidation], songController.updateSongLyric);
router.delete('/lyric/:lyricId', [authenticationMiddleware, can([PERMISSION_CODE.DELETE]), validationMiddleware.updateSongLyricValidation], songController.deleteSongLyric);
router.post('/comment/create', [authenticationMiddleware, can([PERMISSION_CODE.CREATE]), validationMiddleware.createSongLyricValidation], songController.createSongComment);
router.delete('/comment/:commentId', [authenticationMiddleware, can([PERMISSION_CODE.DELETE]), validationMiddleware.createSongCommentValidation], songController.deleteSongComment);

module.exports = router;
