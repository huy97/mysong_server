const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songSchema = new Schema({
    shortCode: String,
    title: String,
    thumbnail: {type: String, default: ""},
    thumbnailMedium: {type: String, default: ""},
    artistName: {type: String, default: ""},
    slug: {type: String, default: ""},
    link: {type: String, default: ""},
    mvLink: {type: String, default: ""},
    isOfficial: {type: Boolean, default: false},
    userId: mongoose.ObjectId,
    status: {type: Number, default: 0},
    listen: {type: Number, default: 0},
    duration: {type: Number, default: 0},
    hasLyric: {type: Boolean, default: false},
    lyricLink: {type: String, default: ""},
    zone: {type: String, default: "private"},
    like: {type: Number, default: 0},
    comment: {type: Number, default: 0},
    isDelete: {type: Boolean, default: false}
}, {
    timestamps: true
});
songSchema.index({
    name: 'text',
    description: 'text',
}, {
    weights: {
        title: 1,
        artistName: 1,
    },
});
module.exports = mongoose.model('Song', songSchema);
