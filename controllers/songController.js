const {validationResult} = require("express-validator");
const {defaultResponse} = require('../utils/helper');
const cryptoRandomString = require('crypto-random-string');
const slugify = require('slugify');
const mongoose = require('mongoose');
const songModel = require('../models/song');
const songMediaModel = require('../models/songMedia');
const songCategoryModel = require('../models/songCategory');
const songLyricModel = require('../models/songLyric');

const createNewSong = async (req, res, next) => {
    const {title, thumbnail, mediaId, hasLyric, artistName, lyricLink, zone, isOffical, lyrics, categories} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return defaultResponse(res, 422, "Có lỗi xảy ra", null, errors.array());
    }
    try{
        let shortCode = cryptoRandomString({length: 10, type: 'distinguishable'});
        let slug = slugify(title, '-');
        let link = `/music/${slug}/${shortCode}.html`;
        let mvLink = "";
        if(isOffical){
            mvLink = `/video/${slug}/${shortCode}.html`;
        }
        const song = await songModel.create({
            shortCode,
            title,
            thumbnail,
            artistName,
            hasLyric,
            lyricLink,
            isOffical,
            link,
            mvLink,
            zone,
            slug,
            userId: req.user._id,
        });
        const songMedia = songMediaModel.create({
            songId: song._id,
            mediaId: mongoose.Types.ObjectId(mediaId)
        });
        const songCategories = songCategoryModel.create(categories.map((categoryId) => {
            return {
                songId: song._id,
                categoryId: mongoose.Types.ObjectId(categoryId)
            }
        }));
        const songLyrics = songLyricModel.create(lyrics.map((lyric) => {
            return {
                songId: song._id,
                userId: req.user._id,
                content: lyric
            }
        }));
        Promise.all([songMedia, songCategories, songLyrics]).then((values) => {
            return defaultResponse(res, 200, 'Thành công', song.toJSON());
        }).catch((e) => {
            return defaultResponse(res);
        });
    }catch (e) {
        return defaultResponse(res);
    }
};

const getSongInfo = async (req, res, next) => {
    const {slug, shortCode} = req.body;
    try{
        const song = await songModel.aggregate([
            {
                $match: {
                    slug,
                    shortCode,
                    isDelete: false
                }
            },
            {
                $lookup: {
                    from: 'song_categories',
                    localField: "_id",
                    foriegnField: "songId",
                    as: 'categories'
                }
            }
        ]);
        
        return defaultResponse(res, 200, 'Thành công', song);
    }catch(e){
        return defaultResponse(res);
    }
    
}

module.exports = {
    createNewSong,
    getSongInfo
};
