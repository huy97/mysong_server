const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const {defaultResponse, getFileType} = require('../utils/helper');
const {MEDIA_TYPE} = require('../utils/constant');
const cryptoRandomString = require('crypto-random-string');
const musicMetadata = require('music-metadata');
const mongoose = require('mongoose');
const songMediaModel = require('../models/songMedia');
const mediaModel = require('../models/media');
const slugify = require('slugify');
const sharp = require('sharp');

const uploadMediaFile = async (req, res, next) => {
    try{
        const form = formidable({maxFileSize: 100 * 1024 * 1024});
        form.parse(req, async (err, fields, files) => {
            if(err) return defaultResponse(res);
            if(!files.file.size) return defaultResponse(res, 500, 'Vui lòng nhập file upload.');
            let mediaType = getFileType(files.file);
            if(![MEDIA_TYPE.AUDIO, MEDIA_TYPE.VIDEO, MEDIA_TYPE.IMAGE].includes(mediaType)){
                return defaultResponse(res, 422, `Định dạng không được phép upload.`);
            }
            form.uploadDir = "media_storage/files";
            let minimizePath = null;
            if(mediaType === MEDIA_TYPE.IMAGE){
                form.uploadDir = "storage/files";
                minimizePath = form.uploadDir + '/thumb_' + Date.now() + '_' + cryptoRandomString({length: 20, type: 'numeric'}) + '_' + slugify(files.file.name);
            }
            if(!fs.existsSync(form.uploadDir)){
                fs.mkdirSync(path.resolve(__dirname, '../' + form.uploadDir), { recursive: true });
            }
            let tmpPath = files.file.path;
            let newPath = form.uploadDir + '/' + Date.now() + '_' + cryptoRandomString({length: 20, type: 'numeric'}) + '_' + slugify(files.file.name);
            let mediaInfo = {};
            if(getFileType(files.file) === MEDIA_TYPE.AUDIO || getFileType(files.file) === MEDIA_TYPE.VIDEO) {
                let {format} = await musicMetadata.parseFile(tmpPath);
                if(format){
                    mediaInfo = format;
                }
            }
            mediaModel.create({
                shortCode: cryptoRandomString({length: 10, type: 'distinguishable'}),
                filePath: newPath,
                minimizePath,
                originalPath: newPath,
                mediaType,
                fileSize: files.file.size,
                ...mediaInfo
            }, (err, doc) => {
                if(err) return defaultResponse(res, 500, err.toString());
                fs.rename(tmpPath, newPath, (err) => {
                    if (err) return defaultResponse(res, 500, err.toString());
                    sharp(newPath).resize(300, 300).toFile(minimizePath);
                    return defaultResponse(res, 200, 'Upload thành công.', {
                        data: doc.toJSON()
                    });
                });
            });
        });
    }catch (e) {
        return defaultResponse(res);
    }
};

const getMediaStream = async (req, res, next) => {
    const {songId, type = MEDIA_TYPE.AUDIO} = req.query;
    try{
        let songMediaQuery = songMediaModel.aggregate([
            {
                $match: {songId: mongoose.Types.ObjectId(songId)}
            },
            {
                $lookup: {
                    from: "media",
                    localField: "mediaId",
                    foreignField: "_id",
                    as: "media"
                }
            },
            {
                $unwind: "$media"
            },
            {
                $match: {"media.mediaType": type}
            }
        ]);
        let totalQuery = songMediaModel.countDocuments({songId: mongoose.Types.ObjectId(songId)});
        const [songMedia, total] = await Promise.all([songMediaQuery, totalQuery]);
        return defaultResponse(res, 200, 'Thành công', {
            total: total,
            data: songMedia
        })
    }catch(e){
        return defaultResponse(res);
    }
};

module.exports = {
    uploadMediaFile,
    getMediaStream
};
