const {defaultResponse, getSkipLimit} = require('../utils/helper');
const cryptoRandomString = require('crypto-random-string');
const slugify = require('slugify');
const mongoose = require('mongoose');
const categoryModel = require('../models/category');
const songCategory = require('../models/songCategory');
const { validationResult } = require('express-validator');

const getListCategories = async (req, res, next) => {
    const {skip, limit} = getSkipLimit(req);
    try{
        const resultQuery = categoryModel.find({
            isDelete: false
        }).skip(skip).limit(limit);
        const totalQuery = categoryModel.countDocuments({isDelete: false});
        const [result, total] = await Promise.all([resultQuery, totalQuery]);
        return defaultResponse(res, 200, 'Thành công', {
            total,
            data: result
        })
    }catch(e){
        return defaultResponse(res);
    }
}

const getCategoryInfo = async (req, res, next) => {
    const {shortCode} = req.query;
    try{
        const category = await categoryModel.findOne({shortCode});
        if(!category){
            return defaultResponse(res, 422, "Không tìm thấy dữ liệu.")
        }
        return defaultResponse(res, 200, 'Thành công', {
            data: category
        })
    }catch(e){
        return defaultResponse(res);
    }
}

const getCategorySongs = async (req, res, next) => {
    const {categoryId} = req.params;
    const {skip, limit} = getSkipLimit(req);
    try{
        let match = {
            categoryId: mongoose.Types.ObjectId(categoryId)
        };
        const resultQuery = songCategory.aggregate([
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
                    localField: "artists.categoryId",
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
        const totalQuery = songCategory.countDocuments(match);
        const [result, total] = await Promise.all([resultQuery, totalQuery]);
        return defaultResponse(res, 200, 'Thành công', {
            total,
            data: result
        })
    }catch(e){
        return defaultResponse(res);
    }
}

const createCategory = async (req, res, next) => {
    const {title, thumbnail, cover, description} = req.body;
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return defaultResponse(res, 422, 'Có lỗi xảy ra.', null, errors.array());
    }
    try{
        let shortCode = cryptoRandomString({length: 10, type: 'distinguishable'});
        let slug = slugify(title, '-');
        let link = `/nghe-si/${slug}/${shortCode}.html`;
        const category = await categoryModel.create({
            shortCode,
            title,
            slug,
            link,
            thumbnail,
            cover,
            description
        });
        return defaultResponse(res, 200, 'Thành công', {
            data: category
        });
    }catch(e){
        return defaultResponse(res);
    }
}

const updateCategory = async (req, res, next) => {
    const {categoryId} = req.params;
    const {title, thumbnail, cover, description} = req.body;
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return defaultResponse(res, 422, 'Có lỗi xảy ra.', null, errors.array());
    }
    try{
        const category = await categoryModel.findById(categoryId);
        if(!category){
            return defaultResponse(res, 422, "Không tìm thấy dữ liệu.")
        }
        let slug = slugify(title, '-');
        let link = `/nghe-si/${slug}/${category.shortCode}.html`;
        const newCategory = await categoryModel.findByIdAndUpdate(categoryId, {
            title,
            slug,
            link,
            thumbnail,
            cover,
            description
        }, {
            new: true
        });
        return defaultResponse(res, 200, 'Thành công', {
            data: newCategory
        });
    }catch(e){
        return defaultResponse(res);
    }
}

const deleteCategory = async (req, res, next) => {
    const {categoryId} = req.params;
    try{
        const category = await categoryModel.findById(categoryId);
        if(!category){
            return defaultResponse(res, 422, "Không tìm thấy dữ liệu.")
        }
        category.isDelete = true;
        await category.save();
        return defaultResponse(res, 200, 'Thành công');
    }catch(e){
        return defaultResponse(res);
    }
}

module.exports = {
    getListCategories,
    getCategorySongs,
    getCategoryInfo,
    createCategory,
    updateCategory,
    deleteCategory
}