const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const followArtistSchema = new Schema({
    userId: mongoose.ObjectId,
    artistId: mongoose.ObjectId
}, {
    timestamps: true
});

followArtistSchema.index({
    userId: 1,
    artistId: 1
});

module.exports = mongoose.model('FollowArtist', followArtistSchema, 'follow_artists');
