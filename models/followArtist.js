const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const followArtistSchema = new Schema({
    userId: mongoose.ObjectId,
    artistId: mongoose.ObjectId,
    isFollow: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model('FollowArtist', followArtistSchema, 'follow_artists');
