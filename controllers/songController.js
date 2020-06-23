const {validationResult} = require("express-validator");
const {defaultResponse, getSkipLimit} = require('../utils/helper');
const {SONG_STATUS, PERMISSION_CODE} = require('../utils/constant');
const {hasPermission} = require('../middleware/checkPermission');
const cryptoRandomString = require('crypto-random-string');
const slugify = require('slugify');
const lodash = require('lodash');
const mongoose = require('mongoose');
const songModel = require('../models/song');
const artistModel = require('../models/artist');
const mediaModel = require('../models/media');
const songMediaModel = require('../models/songMedia');
const songArtistModel = require('../models/songArtist');
const songCategoryModel = require('../models/songCategory');
const songCommentModel = require('../models/songComment');
const songLyricModel = require('../models/songLyric');
const songLikeModel = require('../models/songLike');

const createNewSong = async (req, res, next) => {
    const {title, thumbnail, thumbnailMedium, thumbnailId, mediaIds = [], hasLyric, artistName, lyricLink, zone, isOfficial, artists = [], lyrics = [], categories = []} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return defaultResponse(res, 422, "Vui lòng nhập đủ thông tin.", null, errors.array());
    }
    try{
        let shortCode = cryptoRandomString({length: 10, type: 'distinguishable'});
        let slug = slugify(title, '-');
        let link = `/music/${slug}/${shortCode}.html`;
        let mvLink = "";
        if(isOfficial){
            mvLink = `/video/${slug}/${shortCode}.html`;
        }
        let status = SONG_STATUS.PRIVATE;
        if(hasPermission([PERMISSION_CODE.MANAGER], req.roles)){
            status = zone === "public" ? SONG_STATUS.ACTIVE : SONG_STATUS.PRIVATE;
        }else{
            zone = "private";
        }
        const song = await songModel.create({
            shortCode,
            title,
            thumbnail,
            thumbnailMedium,
            artistName,
            hasLyric,
            lyricLink,
            isOfficial,
            link,
            mvLink,
            zone,
            status,
            slug,
            userId: req.user._id,
        });
        const songMediaQuery = songMediaModel.create(mediaIds.map((mediaId) => {
            return {
                songId: song._id,
                mediaId: mongoose.Types.ObjectId(mediaId)
            }
        }));
        const artistQuery = artistModel.find({_id: {$in: artists}});
        const songArtistsQuery = songArtistModel.create(artists.map((artistId) => {
            return {
                songId: song._id,
                artistId: mongoose.Types.ObjectId(artistId)
            }
        }));
        const songCategoriesQuery = songCategoryModel.create(categories.map((categoryId) => {
            return {
                songId: song._id,
                categoryId: mongoose.Types.ObjectId(categoryId)
            }
        }));
        const songLyricsQuery = songLyricModel.create(lyrics.map((lyric) => {
            return {
                songId: song._id,
                userId: req.user._id,
                content: lyric
            }
        }));
        const updateMediaQuery = mediaModel.updateMany({_id: {$in: mediaIds}}, {isTemp: false});
        const result = await Promise.all([songMediaQuery, songCategoriesQuery, songLyricsQuery, songArtistsQuery, artistQuery, updateMediaQuery]);
        if(result[4].length){
            song.artistName = result[4].map((obj) => obj.fullName).join(', ');
            await song.save();
        }
        const songCreated = await getUpdatedSong(song.id);
        if(!songCreated.length){
            throw new Error();
        }
        return defaultResponse(res, 200, 'Thành công', {
            data: songCreated[0]
        });
    }catch (e) {
        return defaultResponse(res);
    }
};

const updateSong = async (req, res, next) => {
    const {songId} = req.params;
    const {title, thumbnail, thumbnailMedium, thumbnailId, hasLyric, artistName, lyricLink, zone, status, isOfficial, artists = [], categories = [], lyrics = []} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return defaultResponse(res, 422, "Vui lòng nhập đủ thông tin.", null, errors.array());
    }
    try{
        const song = await songModel.findById(songId);
        if(song.userId !== req.user.id){
            if(!hasPermission([PERMISSION_CODE.MANAGER], req.roles)){
                return Promise.reject('Bạn không có quyền thao tác chức năng này.');
            }
        }
        let updateFields = {};
        updateFields.title = title;
        updateFields.slug = !lodash.isEmpty(title) ? slugify(title, '-') : song.title;
        updateFields.link = `/music/${updateFields.slug}/${song.shortCode}.html`;
        updateFields.isOfficial = lodash.isBoolean(isOfficial) ? isOfficial : song.isOfficial;
        if(updateFields.isOfficial){
            updateFields.mvLink = `/video/${updateFields.slug}/${song.shortCode}.html`;
        }
        updateFields.zone = !lodash.isEmpty(zone) ? zone : song.zone;
        updateFields.artistName = !lodash.isEmpty(artistName) ? artistName : song.artistName;
        updateFields.thumbnail = !lodash.isEmpty(thumbnail) ? thumbnail : song.thumbnail;
        updateFields.thumbnailMedium = !lodash.isEmpty(thumbnailMedium) ? thumbnailMedium : song.thumbnailMedium;
        updateFields.artistName = !lodash.isEmpty(artistName) ? artistName : song.artistName;
        updateFields.hasLyric = lodash.isBoolean(hasLyric) ? hasLyric : song.hasLyric;
        updateFields.lyricLink = !lodash.isEmpty(lyricLink) ? lyricLink : song.lyricLink;
        updateFields.status = !lodash.isUndefined(status) ? status : song.status;
        
        let stackDelete = [
            songArtistModel.deleteMany({songId: mongoose.Types.ObjectId(songId)}),
            songCategoryModel.deleteMany({songId: mongoose.Types.ObjectId(songId)})
        ];
        await Promise.all(stackDelete);
        let stackCreate = [
            songArtistModel.create(artists.map((artistId) => {
                return {
                    songId: song._id,
                    artistId: mongoose.Types.ObjectId(artistId)
                }
            })),
            songCategoryModel.create(categories.map((categoryId) => {
                return {
                    songId: song._id,
                    categoryId: mongoose.Types.ObjectId(categoryId)
                }
            })),
            songLyricModel.create(lyrics.map((lyric) => {
                return {
                    songId: song._id,
                    userId: req.user._id,
                    content: lyric
                }
            }))
        ]
        await Promise.all([...stackCreate, songModel.findByIdAndUpdate(songId, updateFields)]);
        const songUpdated = await getUpdatedSong(songId);
        if(!songUpdated.length){
            throw new Error();
        }
        return defaultResponse(res, 200, "Thành công", {
            data: songUpdated[0]
        });
    }catch(e){
        return defaultResponse(res);
    }
};

const getUpdatedSong = async (songId) => {
    const songs = await songModel.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(songId)
            }
        },
        {
            $limit: 1
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
        }
    ]);
    return songs;
}

const deleteSong = async (req, res, next) => {
    const {songId} = req.params;
    try{
        let song = await songModel.findById(songId);
        if(!song){
            return defaultResponse(res, 422, 'Không tìm thấy dữ liệu.');
        }
        if(song.userId !== req.user.id){
            if(!hasPermission([PERMISSION_CODE.MANAGER], req.roles)){
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
    const {slug, shortCode} = req.query;
    console.log(req.query);
    try{
        const songs = await songModel.aggregate([
            {
                $match: {
                    slug,
                    shortCode,
                    isDelete: false
                }
            },
            {
                $limit: 1
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
            }
        ]);
        if(!songs.length){
            return  defaultResponse(res, 422, 'Không tìm thấy dữ liệu');
        }
        await songModel.findByIdAndUpdate(songs[0]._id, {
            $inc: {
                listen: 1
            }
        });
        return defaultResponse(res, 200, 'Thành công', {
            data: songs[0]
        });
    }catch(e){
        console.log(e);
        return defaultResponse(res);
    }

};

const getListSong = async (req, res, next) => {
    const { isOfficial, status = SONG_STATUS.ACTIVE, keyword } = req.query;
    const {skip, limit} = getSkipLimit(req);
    try{
        let match = {
            isDelete: false
        };
        if(!lodash.isEmpty(isOfficial)){
            match.isOfficial = Boolean(isOfficial);
        }
        if(!lodash.isEmpty(status)){
            match.status = Number(status);
        }
        if(!lodash.isEmpty(keyword)){
            match.$text = { $search: keyword };
        }
        const songQuery = songModel.aggregate([
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
            }
        ]);
        const totalQuery = await songModel.countDocuments(match);
        const [songs, total] = await Promise.all([songQuery, totalQuery]);
        return defaultResponse(res, 200, 'Thành công', {
            total,
            data: songs
        });
    }catch(e){
        console.log(e)
        return defaultResponse(res);
    }
};

const getSongLyrics = async (req, res, next) => {
    const {songId} = req.params;
    const {skip, limit} = getSkipLimit(req);
    try{
        const songLyrics = await songLyricModel.aggregate([
            {
                $match: {
                    songId: mongoose.Types.ObjectId(songId)
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
                    from: 'users',
                    localField: "userId",
                    foreignField: "_id",
                    as: 'users'
                }
            },
            {
                $unwind: '$users'
            },
            {
                $project: {
                    'users.password': 0,
                    'users.accessToken': 0,
                }
            }
            ]
        );
        const total = await songLyricModel.countDocuments({songId: mongoose.Types.ObjectId(songId)});
        return defaultResponse(res, 200, 'Thành công', {
            total,
            data: songLyrics
        });
    }catch (e) {
        return defaultResponse(res);
    }
};

const getSongComments = async (req, res, next) => {
    const {songId} = req.params;
    const {skip, limit} = getSkipLimit(req);
    try{
        const songComments = await songCommentModel.aggregate([
                {
                    $match: {
                        songId: mongoose.Types.ObjectId(songId)
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
                        from: 'users',
                        localField: "userId",
                        foreignField: "_id",
                        as: 'users'
                    }
                },
                {
                    $unwind: '$users'
                },
                {
                    $project: {
                        'users.password': 0,
                        'users.accessToken': 0,
                    }
                }
            ]
        );
        const total = await songCommentModel.countDocuments({songId: mongoose.Types.ObjectId(songId)});
        return defaultResponse(res, 200, 'Thành công', {
            total,
            data: songComments
        });
    }catch (e) {
        return defaultResponse(res);
    }
};

const createSongLyric = async (req, res, next) => {
    const {songId, content} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return defaultResponse(res, 422, "Vui lòng nhập đủ thông tin.", null, errors.array());
    }
    try {
        const songLyric = await songLyricModel.create({
            songId: mongoose.Types.ObjectId(songId),
            userId: req.user._id,
            content
        });
        return defaultResponse(res, 200, 'Thành công', {
            data: songLyric
        });
    }catch (e) {
        return defaultResponse(res);
    }
};

const updateSongLyric = async (req, res, next) => {
    const {lyricId} = req.params;
    const {content} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return defaultResponse(res, 422, "Vui lòng nhập đủ thông tin.", null, errors.array());
    }
    try {
        const songLyric = await songLyricModel.findById(lyricId);
        if(songLyric.userId !== req.user.id){
            if(!hasPermission([PERMISSION_CODE.MANAGER], req.roles)){
                return defaultResponse(res, 403,'Bạn không có quyền thao tác chức năng này.');
            }
        }
        songLyric.content = content;
        await songLyric.save();
        return defaultResponse(res, 200, 'Thành công', {
            data: songLyric
        });
    }catch (e) {
        console.log(e)
        return defaultResponse(res);
    }
};

const deleteSongLyric = async (req, res, next) => {
    const {lyricId} = req.params;
    try{
        const lyric = await songLyricModel.findById(lyricId);
        if(!lyric){
            return defaultResponse(res, 422, 'Không tìm thấy dữ liệu.');
        }
        if(lyric.userId !== req.user.id){
            if(!hasPermission([PERMISSION_CODE.MANAGER], req.roles)){
                return defaultResponse(res, 403, 'Bạn không có quyền thao tác chức năng này.');
            }
        }
        await lyric.remove();
        return defaultResponse(res, 200, 'Thành công');
    }catch (e) {
        return defaultResponse(res);
    }
};

const createSongComment = async (req, res, next) => {
    const {songId, content} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return defaultResponse(res, 422, "Vui lòng nhập đủ thông tin.", null, errors.array());
    }
    try {
        const songComment = await songCommentModel.create({
            songId: mongoose.Types.ObjectId(songId),
            userId: req.user._id,
            content
        });
        await songModel.findByIdAndUpdate(songId, {
            $inc: {
                comment: 1
            }
        });
        return defaultResponse(res, 200, 'Thành công', {
            data: songComment
        });
    }catch (e) {
        return defaultResponse(res);
    }
};

const deleteSongComment = async (req, res, next) => {
    const {commentId} = req.params;
    try{
        const comment = await songCommentModel.findById(commentId);
        if(!comment){
            return defaultResponse(res, 422, 'Không tìm thấy dữ liệu.');
        }
        if(comment.userId !== req.user.id){
            if(!hasPermission([PERMISSION_CODE.MANAGER], req.roles)){
                return defaultResponse(res, 403, 'Bạn không có quyền thao tác chức năng này.');
            }
        }
        await comment.remove();
        await songModel.findByIdAndUpdate(comment.songId, {
            $inc: {
                comment: -1
            }
        });
        return defaultResponse(res, 200, 'Thành công');
    }catch (e) {
        return defaultResponse(res);
    }
};

const likeDislikeSong = async (req, res, next) => {
    const {songId} = req.params;
    const {isLike} = req.body;
    try{
        const exist = await songLikeModel.findOne({songId, userId: req.user._id});
        if(exist){
            if(isFollow){
                return defaultResponse(res, 200, 'Thành công');
            }
        }else{
            if(!isFollow){
                return defaultResponse(res, 200, 'Thành công');
            }
        }

        if(isLike){
            await songLikeModel.create({songId, userId: req.user._id});
        }else{
            const songLike = await songLikeModel.deleteOne({songId, userId: req.user._id});
        }
        await songModel.findByIdAndUpdate(songId, {
            $inc: {
                like: isLike ? 1 : -1
            }
        });
        return defaultResponse(res, 200, 'Thành công');
    }catch (e) {
        return defaultResponse(res);
    }
};


module.exports = {
    createNewSong,
    updateSong,
    deleteSong,
    getSongInfo,
    getListSong,
    getSongLyrics,
    createSongLyric,
    updateSongLyric,
    deleteSongLyric,
    createSongComment,
    deleteSongComment,
    getSongComments,
    likeDislikeSong,
};
