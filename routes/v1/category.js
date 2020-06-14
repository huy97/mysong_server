'use strict';
const express = require('express');
const router = express.Router();
const authenticationMiddleware = require('../../middleware/authenticated');
const {can} = require('../../middleware/checkPermission');
const {PERMISSION_CODE} = require('../../utils/constant');
const categoryController = require('../../controllers/categoryController');
const categoryValidation = require('../../middleware/validation/category');

router.get('/get-list-categories', categoryController.getListCategories);
router.get('/get-category-info', categoryController.getCategoryInfo);
router.post('/create', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER]), categoryValidation.createNewCategory], categoryController.createCategory);
router.put('/:categoryId', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER]), categoryValidation.updateCategory], categoryController.updateCategory);
router.delete('/:categoryId', [authenticationMiddleware, can([PERMISSION_CODE.MANAGER])], categoryController.deleteCategory);
router.get('/:categoryId/get-list-songs', categoryController.getCategorySongs);

module.exports = router;