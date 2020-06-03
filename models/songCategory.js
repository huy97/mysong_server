const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songCategorySchema = new Schema({
    songId: mongoose.ObjectId,
    categoryId: mongoose.ObjectId
}, {
    timestamps: true
});

module.exports = mongoose.model('SongCategory', songCategorySchema, 'song_categories');
