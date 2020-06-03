const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const artistSchema = new Schema({
    shortCode: {type: String, default: ""},
    fullName: {type: String, default: ""},
    isComposer: {type: Boolean, default: false},
    thumbnail: {type: String, default: ""},
    cover: {type: String, default: ""},
    slug: {type: String, default: ""},
    link: {type: String, default: ""},
    isDelete: {type: Boolean, default: false}
}, {
    timestamps: true
});

module.exports = mongoose.model('Artist', artistSchema);
