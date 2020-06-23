const {body} = require('express-validator');

const createNewArtist = [
    body('fullName').notEmpty().withMessage('Vui lòng nhập tên ca sĩ/nhạc sĩ'),
    body('thumbnail').notEmpty().withMessage('Vui lòng tải lên ảnh đại diện'),
    body('cover').notEmpty().withMessage('Vui lòng tải lên ảnh bìa'),
];
const updateArtist = [
    body('fullName').notEmpty().withMessage('Vui lòng nhập tên ca sĩ/nhạc sĩ'),
    body('thumbnail').notEmpty().withMessage('Vui lòng tải lên ảnh đại diện'),
    body('cover').notEmpty().withMessage('Vui lòng tải lên ảnh bìa'),
];

module.exports = {
    createNewArtist,
    updateArtist
}