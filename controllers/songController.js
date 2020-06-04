const {validationResult} = require("express-validator");
const {defaultResponse, getSkipLimit, getTotal} = require('../utils/helper');
const {hasPermission} = require('../middleware/checkPermission');
const cryptoRandomString = require('crypto-random-string');
const slugify = require('slugify');
const mongoose = require('mongoose');
const songModel = require('../models/song');
const songMediaModel = require('../models/songMedia');
const songCategoryModel = require('../models/songCategory');
const songLyricModel = require('../models/songLyric');

const createNewSong = async (req, res, next) => {
    const {title, thumbnail, mediaId, hasLyric, artistName, lyricLink, zone, isOffical, lyrics = [], categories = []} = req.body;
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
            return defaultResponse(res, 200, 'Thành công', {
                data: song.toJSON()
            });
        }).catch((e) => {
            return defaultResponse(res);
        });
    }catch (e) {
        console.log(e)
        return defaultResponse(res);
    }
};

const updateSong = async (req, res, next) => {
    const {songId} = req.params;
    try{
        let song = await songModel.findById(songId);
    }catch(e){

    }
};

const deleteSong = async (req, res, next) => {
    const {songId} = req.params;
    try{
        let song = await songModel.findById(songId);
        if(song.userId !== req.user.id){
            if(!hasPermission(['MANAGER'], req.roles)){
                return defaultResponse(res, 403, 'Bạn không có quyền thao tác chức năng này');
            }
        }
        song.isDelete = true;
        await song.save();
        return defaultResponse(res, 200, 'Thành công');
    }catch(e){
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
                    localField: "_id",
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
                    from: 'song_lyrics',
                    localField: "_id",
                    foreignField: "songId",
                    as: 'lyrics'
                }
            },
            {
                $lookup: {
                    from: "song_likes",
                    let: { id: "$_id" },
                    pipeline: [
                        { $match: {
                                isLike: true,
                                $expr: { $eq: [ "$$id", "$songId" ] }
                            }},
                        { $count: "count" }
                    ],
                    "as": "like"
                }
            },
            {
                $lookup: {
                    from: "song_comments",
                    let: { id: "$_id" },
                    pipeline: [
                        { $match: {
                                isLike: true,
                                $expr: { $eq: [ "$$id", "$songId" ] }
                            }},
                        { $count: "count" }
                    ],
                    "as": "comment"
                }
            },
            {
                $addFields: {
                    like: { $sum: "$like.count" },
                    comment: { $sum: "$comment.count" },
                }
            },
            {
                $limit: 1
            }
        ]);
        if(song.length){
            await songModel.findByIdAndUpdate(song[0]._id, {listen: song[0].listen + 1});
            return defaultResponse(res, 200, 'Thành công', {
                data: song[0]
            });
        }else{
            return defaultResponse(res, 422, 'Không tìm thấy dữ liệu.');
        }
    }catch(e){
        console.log(e)
        return defaultResponse(res);
    }

};

const getListSong = async (req, res, next) => {
    const { isOffical = false, sort = {_id: -1} } = req.body;
    const {skip, limit} = getSkipLimit(req);
    try{
        let query = [
            {
                $match: {
                    isOffical,
                    isDelete: false
                }
            },
            {
                $lookup: {
                    from: 'song_categories',
                    localField: "_id",
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
                    localField: "_id",
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
                    from: 'song_likes',
                    localField: "_id",
                    foreignField: "songId",
                    as: 'likes'
                }
            },
            {
                $sort: sort
            }
        ];
        const total =  await songModel.aggregate([...query,
            {
                $count: "total"
            }
        ]);
        const song = await songModel.aggregate([...query,
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ]);
        return defaultResponse(res, 200, 'Thành công', {
            total: getTotal(total),
            data: song
        });
    }catch(e){
        console.log(e)
        return defaultResponse(res);
    }
};

module.exports = {
    createNewSong,
    updateSong,
    deleteSong,
    getSongInfo,
    getListSong
};
