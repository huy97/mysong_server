const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songLikeSchema = new Schema({
    songId: [{type: mongoose.Schema.Types.ObjectId, ref: 'Song'}],
    userId: mongoose.ObjectId,
    isLike: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model('SongLike', songLikeSchema, 'song_likes');
