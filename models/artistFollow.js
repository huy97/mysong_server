const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const artistFollowSchema = new Schema({
    userId: mongoose.ObjectId,
    artistId: mongoose.ObjectId,
    isFollow: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model('ArtistFollow', artistFollowSchema, 'artists_follow');
