const {defaultResponse} = require('../utils/helper');

const maintenance = (isMaintain) => {
    return (req, res, next) => {
        if (isMaintain === 'maintenance') {
            return defaultResponse(res, 500, 'Hệ thống đang tiến hành bảo trì và nâng cấp.');
        }
        next();
    }
};

module.exports = maintenance;
