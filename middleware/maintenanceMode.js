const {defaultResponse} = require('../utils/helper');

const maintenanceMode = (isMaintain) => {
    return (req, res, next) => {
        if (isMaintain === 'maintenance') {
            return defaultResponse(res, 500, 'Bảo trì hệ thống');
        }
        next();
    }
};

module.exports = maintenanceMode;
