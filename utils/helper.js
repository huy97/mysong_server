const {MEDIA_TYPE} = require('./constant');

const defaultResponse = (res, status = 500, message = 'Có lỗi xảy ra, vui lòng quay lại sau.', data = {}, errors, code = 0) => {
    return res.status(status).json({
        code,
        status,
        message,
        ...data,
        errors
    });
};

const getSkipLimit = (req) => {
  let skip = req.query.skip || req.body.skip || 0;
  let limit = req.query.limit || req.body.limit || 100;
  return {skip: parseInt(skip), limit: parseInt(limit)};
};

const getTotal = (total) => {
    if(Array.isArray(total) && total.length){
        return total[0].total;
    }
    return 0;
}

function getFileType(file) {
    if(file.type.match('image.*'))
        return MEDIA_TYPE.IMAGE;
    if(file.type.match('video.*'))
        return MEDIA_TYPE.VIDEO;
    if(file.type.match('audio.*'))
        return MEDIA_TYPE.AUDIO;
    return MEDIA_TYPE.OTHER;
}

module.exports = {
    defaultResponse,
    getSkipLimit,
    getTotal,
    getFileType
};
