const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const artistSchema = new Schema({
    shortCode: {type: String, default: "", unique: true},
    fullName: {type: String, default: ""},
    isComposer: {type: Boolean, default: false},
    thumbnail: {type: String, default: ""},
    follow: {type: Number, default: 0},
    cover: {type: String, default: ""},
    slug: {type: String, default: ""},
    link: {type: String, default: ""},
    isDelete: {type: Boolean, default: false}
}, {
    timestamps: true
});

artistSchema.index({
    shortCode: 1,
    fullName: 'text'
}, {
    weights: {
        fullName: 1
    },
});

module.exports = mongoose.model('Artist', artistSchema);
