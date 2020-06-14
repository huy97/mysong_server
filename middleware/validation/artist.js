const {body} = require('express-validator');

const createNewArtist = [
    body('fullName').notEmpty().withMessage('Vui lòng nhập tên ca sĩ/nhạc sĩ')
];
const updateArtist = [
    body('fullName').notEmpty().withMessage('Vui lòng nhập tên ca sĩ/nhạc sĩ')
];

module.exports = {
    createNewArtist,
    updateArtist
}