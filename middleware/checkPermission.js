const {PERMISSION_CODE} = require('../utils/constant');
const {defaultResponse} = require('../utils/helper');

const hasPermission = (permission = [], roles = []) => {
    let hasPermission = false;
    permission.map((per) => {
        roles.map((role) => {
            if(role.permissionCodes && Array.isArray(role.permissionCodes) && role.permissionCodes.includes(per)){
                hasPermission = true;
                return false;
            }
        });
    });
    return hasPermission;
}

const can = (permission = []) => {
    return function (req, res, next) {
        if(!hasPermission(permission, req.roles)){
            return defaultResponse(res, 403, 'Bạn không có quyền thao tác chức năng này');
        }
        next();
    }
};

module.exports = {
    can,
    hasPermission
};
