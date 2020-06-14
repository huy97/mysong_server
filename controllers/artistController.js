const {defaultResponse, getSkipLimit} = require('../utils/helper');
const cryptoRandomString = require('crypto-random-string');
const slugify = require('slugify');
const mongoose = require('mongoose');
const artistModel = require('../models/artist');
const followArtistModel = require('../models/followArtist');
const songArtist = require('../models/songArtist');
const { validationResult } = require('express-validator');

const getListArtists = async (req, res, next) => {
    const {skip, limit} = getSkipLimit(req);
    try{
        const resultQuery = artistModel.find({
            isDelete: false
        }).skip(skip).limit(limit);
        const totalQuery = artistModel.countDocuments({isDelete: false});
        const [result, total] = await Promise.all([resultQuery, totalQuery]);
        return defaultResponse(res, 200, 'Thành công', {
            total,
            data: result
        })
    }catch(e){
        return defaultResponse(res);
    }
}

const getArtistInfo = async (req, res, next) => {
    const {shortCode} = req.query;
    try{
        const artist = await artistModel.findOne({shortCode});
        if(!artist){
            return defaultResponse(res, 422, "Không tìm thấy dữ liệu.")
        }
        return defaultResponse(res, 200, 'Thành công', {
            data: artist
        })
    }catch(e){
        return defaultResponse(res);
    }
}

const getArtistSongs = async (req, res, next) => {
    const {artistId} = req.params;
    const {skip, limit} = getSkipLimit(req);
    try{
        let match = {
            artistId: mongoose.Types.ObjectId(artistId)
        };
        const resultQuery = songArtist.aggregate([
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
                $lookup: {
                    from: 'song_categories',
                    localField: "songId",
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
                    localField: "songId",
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
                    from: 'songs',
                    localField: 'songId',
                    foreignField: '_id',
                    as: 'song'
                }
            },
            {
                $unwind: "$song"
            },
            {
                $addFields: {
                    "song.artists": "$artists",
                    "song.categories": "$categories",
                }
            },
            {
                $project: {
                    "artists": 0,
                    "categories": 0
                }
            }
        ]);
        const totalQuery = songArtist.countDocuments(match);
        const [result, total] = await Promise.all([resultQuery, totalQuery]);
        return defaultResponse(res, 200, 'Thành công', {
            total,
            data: result
        })
    }catch(e){
        return defaultResponse(res);
    }
}

const followArtist = async (req, res, next) => {
    const {artistId} = req.params;
    const {isFollow} = req.body;
    try{
        const exist = await followArtistModel.findOne({artistId, userId: req.user._id});
        if(exist){
            if(isFollow){
                return defaultResponse(res, 200, 'Thành công');
            }
        }else{
            if(!isFollow){
                return defaultResponse(res, 200, 'Thành công');
            }
        }
        if(isFollow){
            await followArtistModel.create({artistId, userId: req.user._id});
        }else{
            await followArtistModel.findOne({artistId, userId: req.user._id});
        }
        await artistModel.findByIdAndUpdate(artistId, {
            $inc: {
                follow: isFollow ? 1 : -1
            }
        });
        return defaultResponse(res, 200, 'Thành công');
    }catch (e) {
        console.log(e);
        
        return defaultResponse(res);
    }
}

const createArtist = async (req, res, next) => {
    const {fullName, thumbnail, cover, isComposer = false} = req.body;
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return defaultResponse(res, 422, 'Có lỗi xảy ra.', null, errors.array());
    }
    try{
        let shortCode = cryptoRandomString({length: 10, type: 'distinguishable'});
        let slug = slugify(fullName, '-');
        let link = `/nghe-si/${slug}/${shortCode}.html`;
        const artist = await artistModel.create({
            shortCode,
            fullName,
            slug,
            link,
            thumbnail,
            cover,
            isComposer
        });
        return defaultResponse(res, 200, 'Thành công', {
            data: artist
        });
    }catch(e){
        return defaultResponse(res);
    }
}

const updateArtist = async (req, res, next) => {
    const {artistId} = req.params;
    const {fullName, thumbnail, cover, isComposer = false} = req.body;
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return defaultResponse(res, 422, 'Có lỗi xảy ra.', null, errors.array());
    }
    try{
        const artist = await artistModel.findById(artistId);
        if(!artist){
            return defaultResponse(res, 422, "Không tìm thấy dữ liệu.")
        }
        let slug = slugify(fullName, '-');
        let link = `/nghe-si/${slug}/${artist.shortCode}.html`;
        const newArtist = await artistModel.findByIdAndUpdate(artistId, {
            fullName,
            slug,
            link,
            thumbnail,
            cover,
            isComposer
        }, {
            new: true
        });
        return defaultResponse(res, 200, 'Thành công', {
            data: newArtist
        });
    }catch(e){
        return defaultResponse(res);
    }
}

const deleteArtist = async (req, res, next) => {
    const {artistId} = req.params;
    try{
        const artist = await artistModel.findById(artistId);
        if(!artist){
            return defaultResponse(res, 422, "Không tìm thấy dữ liệu.")
        }
        artist.isDelete = true;
        await artist.save();
        return defaultResponse(res, 200, 'Thành công');
    }catch(e){
        return defaultResponse(res);
    }
}

module.exports = {
    getListArtists,
    followArtist,
    getArtistSongs,
    getArtistInfo,
    createArtist,
    updateArtist,
    deleteArtist
}