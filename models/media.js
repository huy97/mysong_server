const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mediaSchema = new Schema({
    shortCode: {type: String, default: "", unique: true},
    mediaType: {type: String, default: ""},
    filePath: {type: String, default: ""},
    originalPath: {type: String, default: ""},
    duration: {type: Number, default: 0},
    fileSize: {type: Number, default: 0},
    view: {type: Number, default: 0},
}, {
    timestamps: true
});

mediaSchema.index({
    shortCode: 1
});

module.exports = mongoose.model('Media', mediaSchema);
