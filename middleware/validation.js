const {check, body, param} = require('express-validator');
const userModel = require('../models/user');
const categoryModel = require('../models/category');
const mediaModel = require('../models/media');

const createUserValidation = [
    body('fullName').notEmpty().withMessage('Vui lòng nhập tên hiển thị.'),
    body('username').notEmpty().withMessage('Vui lòng nhập tên đăng nhập.')
        .isLength({min: 5}).withMessage("Tên đăng nhập phải ít nhất 5 ký tự.")
        .isLength({max: 32}).withMessage("Tên đăng nhập không được quá 32 ký tự.")
        .custom((value) => {
            return value.indexOf('admin') === -1 && value.indexOf('root') === -1;
        }).withMessage("Tên đăng nhập không hợp lệ.")
        .custom(async (value, {req}) => {
            let user = await userModel.findOne({username: req.body.username});
            return user && Promise.reject(false);
        }).withMessage("Tên đăng nhập này đã tồn tại."),
    body('password').notEmpty().withMessage('Vui lòng nhập mật khẩu.')
        .isLength({min: 6}).withMessage("Mật khẩu phải ít nhất 6 ký tự.")
        .isLength({max: 32}).withMessage("Mật khẩu không được quá 32 ký tự."),
    body('confirmPassword').notEmpty().withMessage('Vui lòng nhập lại mật khẩu.')
        .custom((value, {req}) => {
            return (value === req.body.password);
        }).withMessage('Hai mật khẩu không giống nhau.')
];

const createNewSongValidation = [
    body('title').notEmpty().withMessage('Vui lòng nhập tiêu đề.'),
    body('thumbnail').notEmpty().withMessage('Vui lòng tải lên ảnh đại diện.'),
    body('mediaId').notEmpty().withMessage('Vui lòng tải lên file media.').custom(async (value) => {
        try{
            let existMedia = await mediaModel.findById(value);
            if(!existMedia){
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

module.exports = {
    createUserValidation,
    createNewSongValidation
};
