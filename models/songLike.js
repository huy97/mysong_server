const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songLikeSchema = new Schema({
    songId: [{type: mongoose.Schema.Types.ObjectId, ref: 'Song'}],
    userId: mongoose.ObjectId
}, {
    timestamps: true
});

songLikeSchema.index({
    songId: 1,
    userId: 1
});

module.exports = mongoose.model('SongLike', songLikeSchema, 'song_likes');
