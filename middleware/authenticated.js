const jwt = require('jsonwebtoken');
const fs = require('fs');
const userModel = require('../models/user');
const userRoleModel = require('../models/userRole');
const {defaultResponse} = require('../utils/helper');

const Authenticated = async (req, res, next) => {
    const token = req.headers.authorization || req.cookies.token;
    if(!token){
        return defaultResponse(res, 404, 'Trang không tồn tại.')
    }
    const privateKey = await fs.readFileSync('private.key');
    try{
        const verify = await jwt.verify(token, privateKey);
        const user = await userModel.findOne({_id: verify.uid, accessToken: token}, {password: 0});
        if(!user) throw new Error();
        const userRole = await userRoleModel.aggregate([
            {
                $match: {
                    userId: user._id
                }
            },
            {
                $project: {
                    roleId: 1,
                    roles: 1
                }
            },
            {
                $lookup: {
                    from: 'roles',
                    localField: 'roleId',
                    foreignField: 'roleId',
                    as: 'roles'
                }
            }
        ]);
        req.user = user;
        let roles = [];
        userRole.map((role) => {
            roles = [...roles, ...role.roles]
        });
        req.roles = roles;
        
    }catch (e) {
        return defaultResponse(res, 401, 'Uỷ quyền thất bại.')
    }
    next();
};

module.exports = Authenticated;
