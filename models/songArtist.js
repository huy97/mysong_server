const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songArtistSchema = new Schema({
    songId: mongoose.ObjectId,
    artistId: mongoose.ObjectId
}, {
    timestamps: true
});

songArtistSchema.index({
    songId: 1,
    artistId: 1
});

module.exports = mongoose.model('SongArtist', songArtistSchema, 'song_artists');
