const {body, param} = require('express-validator');
const userModel = require('../../models/user');

const registerValidation = [
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

const createUserValidation = [
    ...registerValidation,
    body('avatar').notEmpty().withMessage('Vui lòng tải lên ảnh đại diện')
];

const updateUserValidation = [
    body('fullName').notEmpty().withMessage('Vui lòng nhập tên hiển thị.'),
    body('avatar').notEmpty().withMessage('Vui lòng tải lên ảnh đại diện.'),
    body('newPassword').optional().isLength({min: 6}).withMessage("Mật khẩu phải ít nhất 6 ký tự.")
        .isLength({max: 32}).withMessage("Mật khẩu không được quá 32 ký tự."),
];

const updateUserPasswordValidation = [
    body('oldPassword').notEmpty().withMessage('Vui lòng nhập mật khẩu cũ.'),
    body('password').notEmpty().withMessage('Vui lòng nhập mật khẩu mới.')
        .isLength({min: 6}).withMessage("Mật khẩu mới phải ít nhất 6 ký tự.")
        .isLength({max: 32}).withMessage("Mật khẩu mới không được quá 32 ký tự."),
    body('confirmPassword').notEmpty().withMessage('Vui lòng nhập lại mật khẩu mới.')
        .custom((value, {req}) => {
            return (value === req.body.password);
        }).withMessage('Hai mật khẩu không giống nhau.')
];

const createRole = [
    body('description').notEmpty().withMessage('Vui lòng nhập mô tả.'),
    body('permissionCodes').isArray().isLength().withMessage('Vui lòng chọn quyền.'),
]

module.exports = {
    registerValidation,
    createUserValidation,
    updateUserValidation,
    updateUserPasswordValidation,
    createRole
};
