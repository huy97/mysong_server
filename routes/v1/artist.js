'use strict';
const express = require('express');
const router = express.Router();
const authenticationMiddleware = require('../../middleware/authenticated');
const {can} = require('../../middleware/checkPermission');
const {PERMISSION_CODE} = require('../../utils/constant');
const artistController = require('../../controllers/artistController');
const artistValidation = require('../../middleware/validation/artist');

router.get('/get-list-artists', artistController.getListArtists);
router.get('/get-artist-info', artistController.getArtistInfo);
router.post('/create', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER]), artistValidation.createNewArtist], artistController.createArtist);
router.put('/:artistId', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER]), artistValidation.updateArtist], artistController.updateArtist);
router.delete('/:artistId', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER])], artistController.deleteArtist);
router.get('/:artistId/get-list-songs', artistController.getArtistSongs);
router.post('/:artistId/follow', [authenticationMiddleware], artistController.followArtist);

module.exports = router;