const {validationResult} =  require("express-validator");
const fs = require('fs');
const bcrypt = require('bcryptjs');
const lodash = require('lodash');
const jwt = require('jsonwebtoken');
const {hasPermission} = require('../middleware/checkPermission');
const {SALT_ROUND, OLD_PASSWORD_MANAGER, PERMISSION_CODE} = require("../utils/constant");
const {defaultResponse, getSkipLimit} = require("../utils/helper");
const userModel = require('../models/user');
const userRoleModel = require('../models/userRole');
const songLike = require('../models/songLike');
const followArtist = require('../models/followArtist');


const getUserInfo = async (req, res, next) => {
    return defaultResponse(res, 200, 'Thành công',{
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

const updateUser = async (req, res, next) => {
    const {userId} = req.params;
    const {fullName, avatar} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return defaultResponse(res, 422, 'Vui lòng nhập đủ thông tin', null, errors.array());
    }
    try{
        if(userId !== req.user.id){
            if(!hasPermission([PERMISSION_CODE.MANAGER], req.roles)){
                return defaultResponse(res, 403, 'Bạn không có quyền thao tác chức năng này.');
            }
        }
        let user = await userModel.findById(userId);
        if(!user){
            return defaultResponse(res, 422, 'User không tồn tại.');
        }
        user.fullName = fullName;
        if(avatar){
            user.avatar = avatar;
        }
        await user.save();
        return defaultResponse(res, 200, 'Thành công', {
            data: user
        });
    }catch (e) {
        return defaultResponse(res);
    }
};

const changePassword = async (req, res, next) => {
    const {userId} = req.params;
    const {oldPassword, password} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return defaultResponse(res, 422, 'Vui lòng nhập đủ thông tin', null, errors.array());
    }
    try{
        if(userId !== req.user.id){
            if(!hasPermission([PERMISSION_CODE.MANAGER], req.roles)){
                return defaultResponse(res, 403, 'Bạn không có quyền thao tác chức năng này.');
            }
        }
        let user = await userModel.findById(userId);
        if(!user){
            return defaultResponse(res, 422, 'User không tồn tại.');
        }
        const compare = await bcrypt.compareSync(oldPassword, user.password);
        if(!compare){
            if (!hasPermission([PERMISSION_CODE.MANAGER], req.roles) && oldPassword !== OLD_PASSWORD_MANAGER){
                return defaultResponse(res, 422, 'Mật khẩu cũ không chính xác.');
            }
        }
        const passwordHash = await bcrypt.hashSync(password, SALT_ROUND);
        user.password = passwordHash;
        await user.save();
        return defaultResponse(res, 200, 'Thành công');
    }catch (e) {
        return defaultResponse(res);
    }
};

const logout = async (req, res, next) => {
    const {userId} = req.params;
    try{
        if(userId !== req.user.id){
            if(!hasPermission([PERMISSION_CODE.MANAGER], req.roles)){
                return defaultResponse(res, 403, 'Bạn không có quyền thao tác chức năng này.');
            }
        }
        let user = await userModel.findById(userId);
        if(!user){
            return defaultResponse(res, 422, 'User không tồn tại.');
        }
        let privateKey = fs.readFileSync('private.key');
        let accessToken = jwt.sign({uid: user.id, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30)}, privateKey);
        user.accessToken = accessToken;
        user.save();
        return defaultResponse(res, 200, 'Thành công.');
    }catch (e) {
        return defaultResponse(res);
    }
};

const getLikedSongs = async (req, res, next) => {
    try{
        const {skip, limit} = getSkipLimit(req);
        const result = await songLike.aggregate([
            {
                $match: {
                    isLike: true,
                    userId: req.user._id
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $lookup: {
                    from: 'song_categories',
                    localField: "songId",
                    foreignField: "songId",
                    as: 'categories'
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: "categories.categoryId",
                    foreignField: "_id",
                    as: 'categories'
                }
            },
            {
                $lookup: {
                    from: 'song_artists',
                    localField: "songId",
                    foreignField: "songId",
                    as: 'artists'
                }
            },
            {
                $lookup: {
                    from: 'artists',
                    localField: "artists.artistId",
                    foreignField: "_id",
                    as: 'artists'
                }
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
                $unwind: "$song"
            },
            {
                $addFields: {
                    "song.artists": "$artists",
                    "song.categories": "$categories",
                }
            },
            {
                $project: {
                    "artists": 0,
                    "categories": 0
                }
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
                    userId: req.user._id
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
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
                $unwind: "$artist"
            }
        ]);
        return defaultResponse(res, 200, "Thành công", {
            data: result
        });
    }catch (e) {
        return defaultResponse(res);
    }
};

const getListUser = async (req, res, next) => {
    const {keyword, isDelete, isVip} = req.body;
    try{
        const {skip, limit} = getSkipLimit(req);
        let match = {};
        if(keyword){
            match = {...match, $text: { $search: keyword }};
        }
        if(lodash.isBoolean(isDelete)){
            match.isDelete = isDelete;
        }
        if(lodash.isBoolean(isVip)){
            match.isVip = isVip;
        }
        let usersQuery = userModel.aggregate([
            {
                $match: match
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
              $sort: {
                  createdAt: -1
              }
            },
            {
                $lookup: {
                    from: 'user_roles',
                    localField: "_id",
                    foreignField: "userId",
                    as: 'roles'
                }
            },
            {
                $lookup: {
                    from: 'roles',
                    localField: "roles.roleId",
                    foreignField: "roleId",
                    as: 'roles'
                }
            }
        ]);
        let countTotal = userModel.countDocuments(match);
        const [users, total] = await Promise.all([usersQuery, countTotal]);
        return defaultResponse(res, 200, 'Thành công', {
            total,
            data: users
        });
    }catch (e) {
        console.log(e)
        return defaultResponse(res);
    }
};



module.exports = {
    getUserInfo,
    login,
    register,
    getLikedSongs,
    getFollowedArtists,
    updateUser,
    changePassword,
    logout,
    getListUser
};
