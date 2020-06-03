const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songLyricSchema = new Schema({
    songId: mongoose.ObjectId,
    userId: mongoose.ObjectId,
    content: {type: String, default: ""},
    isDelete: {type: Boolean, default: false}
}, {
    timestamps: true
});

module.exports = mongoose.model('SongLyric', songLyricSchema, 'song_lyrics');
