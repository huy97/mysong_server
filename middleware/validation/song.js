const {body, param} = require('express-validator');
const songModel = require('../../models/song');
const songLyricModel = require('../../models/songLyric');
const categoryModel = require('../../models/category');
const mediaModel = require('../../models/media');

const createNewSongValidation = [
    body('title').notEmpty().withMessage('Vui lòng nhập tiêu đề.'),
    body('thumbnail').notEmpty().withMessage('Vui lòng tải lên ảnh đại diện.'),
    body('mediaIds').isArray().isLength().withMessage('Vui lòng tải lên file media.').custom(async (value) => {
        try{
            let existMedia = await mediaModel.find({_id: {$in: value}});
            if(!existMedia.length){
                return Promise.reject();
            }
        }catch (e) {
            return Promise.reject();
        }
    }).withMessage('Media không hợp lệ.'),
    body('categories.*').custom(async (category) => {
        try{
            let existCategory = await categoryModel.findById(category);
            if(!existCategory){
                return Promise.reject();
            }
        }catch (e) {
            return Promise.reject();
        }
    }).withMessage('Thể loại không tồn tại.')
];

const updateSongValidation = [
    param('songId').custom(async (value, {req}) => {
        try{
            let existSong = await songModel.findById(value);
            if(!existSong){
                return Promise.reject();
            }
        }catch (e) {
            return Promise.reject();
        }
    }).withMessage('Không tìm thấy dữ liệu.')
];

const createSongLyricValidation = [
    body('songId').notEmpty().withMessage('Vui lòng chọn bài hát.').custom(async (value) => {
        try{
            let existSong = await songModel.findById(value);
            if(!existSong){
                return Promise.reject();
            }
        }catch (e) {
            return Promise.reject();
        }
    }).withMessage('Không tìm thấy dữ liệu.'),
    body('content').notEmpty().withMessage('Vui lòng nhập nội dung')

];

const updateSongLyricValidation = [
    param('lyricId').custom(async (value) => {
        try{
            let existLyric = await songLyricModel.findById(value);
            if(!existLyric){
                return Promise.reject('Không tìm thấy dữ liệu.');
            }
        }catch (e) {
            return Promise.reject('Không tìm thấy dữ liệu.');
        }
    }),
    body('content').notEmpty().withMessage('Vui lòng nhập nội dung')
];

const createSongCommentValidation = [
    body('songId').notEmpty().withMessage('Vui lòng chọn bài hát.').custom(async (value) => {
        try{
            let existSong = await songModel.findById(value);
            if(!existSong){
                return Promise.reject();
            }
        }catch (e) {
            return Promise.reject();
        }
    }).withMessage('Không tìm thấy dữ liệu.'),
    body('content').notEmpty().withMessage('Vui lòng nhập nội dung')

];

module.exports = {
    createNewSongValidation,
    updateSongValidation,
    createSongLyricValidation,
    updateSongLyricValidation,
    createSongCommentValidation
}