const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listenHistorySchema = new Schema({
    songId: mongoose.ObjectId,
    artistId: mongoose.ObjectId
}, {
    timestamps: true
});

listenHistorySchema.index({
    songId: 1,
    artistId: 1
});

module.exports = mongoose.model('ListenHistory', listenHistorySchema, 'listen_histories');
