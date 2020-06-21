'use strict';
const express = require('express');
const router = express.Router();
const authenticationMiddleware = require('../../middleware/authenticated');
const {can} = require('../../middleware/checkPermission');
const {PERMISSION_CODE} = require('../../utils/constant');
const mediaController = require('../../controllers/mediaController');

router.post('/upload', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER, PERMISSION_CODE.CREATE, PERMISSION_CODE.UPDATE, PERMISSION_CODE.DELETE])], mediaController.uploadMediaFile);
router.post('/upload/image', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER, PERMISSION_CODE.CREATE, PERMISSION_CODE.UPDATE, PERMISSION_CODE.DELETE])], mediaController.uploadMediaFile);
router.get('/get-media-stream', mediaController.getMediaStream);

module.exports = router;
