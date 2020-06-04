const {validationResult} =  require("express-validator");
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {SALT_ROUND} = require("../utils/constant");
const {defaultResponse, getSkipLimit} = require("../utils/helper");
const userModel = require('../models/user');
const userRoleModel = require('../models/userRole');
const songLike = require('../models/songLike');
const followArtist = require('../models/followArtist');


const getUserInfo = async (req, res, next) => {
    return defaultResponse(res, 200, {
        data: req.user
    });
};
const login = async (req, res, next) => {
    const {username, password} = req.body;
    try{
        const user = await userModel.findOne({username});
        if(!user){
            return  defaultResponse(res, 422, 'Tên đăng nhập không tồn tại');
        }
        const compare = await bcrypt.compareSync(password, user.password);
        if(!compare){
            return  defaultResponse(res, 422, 'Mật khẩu bạn nhập vào không đúng.');
        }
        let privateKey = fs.readFileSync('private.key');
        let accessToken = jwt.sign({uid: user.id,  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30)}, privateKey);
        user.accessToken = accessToken;
        await user.save();
        return defaultResponse(res, 200, 'Đăng nhập thành công.', {
            accessToken: accessToken
        });
    }catch (e) {
        console.log(e)
        return defaultResponse(res);
    }
};
const register = async (req, res, next) => {
    const {fullName, username, password} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return defaultResponse(res, 422, 'Vui lòng nhập đủ thông tin', null, errors.array());
    }
    try{
        const passwordHash = await bcrypt.hashSync(password, SALT_ROUND);
        const user = await userModel.create({
            fullName,
            username,
            password: passwordHash
        });

        let privateKey = fs.readFileSync('private.key');
        let accessToken = jwt.sign({uid: user.id, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30)}, privateKey);
        user.accessToken = accessToken;
        user.save();
        const userRole = await userRoleModel.create({
            userId: user.id,
            roleId: 1
        });
        return defaultResponse(res, 200, 'Tạo tài khoản thành công.', {
            data: user
        });
    }catch (e) {
        return defaultResponse(res)
    }
};
const getLikedSongs = async (req, res, next) => {
    try{
        const {skip, limit} = getSkipLimit(req);
        const result = await songLike.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    isDelete: false
                }
            },
            {
                $skip: skip
            },
            {
                $lookup: {
                    from: 'songs',
                    localField: 'songId',
                    foreignField: '_id',
                    as: 'song'
                }
            },
            {
                $limit: limit
            },
            {
                $unwind: "$song"
            }
        ]);
        return defaultResponse(res, 200, "Thành công", {
            data: result
        });
    }catch (e) {
        return defaultResponse(res);
    }
};
const getFollowedArtists = async (req, res, next) => {
    try{
        const {skip, limit} = getSkipLimit(req);
        const result = await followArtist.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    isDelete: false
                }
            },
            {
                $skip: skip
            },
            {
                $lookup: {
                    from: 'artists',
                    localField: 'artistId',
                    foreignField: '_id',
                    as: 'artist'
                }
            },
            {
                $limit: limit
            },
            {
                $unwind: "$song"
            }
        ]);
        return defaultResponse(res, 200, "Thành công", {
            data: result
        });
    }catch (e) {
        return defaultResponse(res);
    }
};

module.exports = {
    getUserInfo,
    login,
    register,
    getLikedSongs,
    getFollowedArtists
};
