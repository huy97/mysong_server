const {PERMISSION_CODE} = require('../utils/constant');
const {defaultResponse} = require('../utils/helper');

const can = (permission = []) => {
    return function (req, res, next) {
        let hasRole = false;
        permission.map((per) => {
            req.roles.map((role) => {
                if(role.permissionCodes.includes(per)){
                    hasRole = true;
                    return false;
                }
            });
        });
        if(!hasRole){
            return defaultResponse(res, 403, 'Bạn không có quyền thao tác chức năng này');
        }
        next();
    }
};

module.exports = {
    can
};
