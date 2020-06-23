const {body} = require('express-validator');

const createNewCategory = [
    body('title').notEmpty().withMessage('Vui lòng nhập tên thể loại'),
    body('thumbnail').notEmpty().withMessage('Vui lòng tải lên ảnh đại diện'),
    body('cover').notEmpty().withMessage('Vui lòng tải lên ảnh bìa'),
];
const updateCategory = [
    body('title').notEmpty().withMessage('Vui lòng nhập tên thể loại'),
    body('thumbnail').notEmpty().withMessage('Vui lòng tải lên ảnh đại diện'),
    body('cover').notEmpty().withMessage('Vui lòng tải lên ảnh bìa'),
];

module.exports = {
    createNewCategory,
    updateCategory
}