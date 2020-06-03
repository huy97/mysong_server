const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songMediaSchema = new Schema({
    songId: mongoose.ObjectId,
    mediaId: mongoose.ObjectId
}, {
    timestamps: true
});

module.exports = mongoose.model('SongMedia', songMediaSchema, 'song_medias');
