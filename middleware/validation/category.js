const {body} = require('express-validator');

const createNewCategory = [
    body('title').notEmpty().withMessage('Vui lòng nhập tên thể loại')
];
const updateCategory = [
    body('title').notEmpty().withMessage('Vui lòng nhập tên thể loại')
];

module.exports = {
    createNewCategory,
    updateCategory
}