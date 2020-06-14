const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    shortCode: {type: String, default: "", unique: true},
    title: {type: String, default: ""},
    description: {type: String, default: ""},
    thumbnail: {type: String, default: ""},
    cover: {type: String, default: ""},
    slug: {type: String, default: ""},
    link: {type: String, default: ""},
    isDelete: {type: Boolean, default: false}
}, {
    timestamps: true
});

categorySchema.index({
    shortCode: 1,
    title: 'text',
}, {
    weights: {
        title: 1
    },
});

module.exports = mongoose.model('Category', categorySchema);
