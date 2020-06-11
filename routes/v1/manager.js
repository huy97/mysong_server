'use strict';
const express = require('express');
const router = express.Router();
const authenticationMiddleware = require('../../middleware/authenticated');
const {can} = require('../../middleware/checkPermission');
const {PERMISSION_CODE} = require('../../utils/constant');
const validationMiddleware = require('../../middleware/validation');
const managerController = require('../../controllers/managerController');

router.post('/roles/create', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER])], userController.getFollowedArtists);

module.exports = router;