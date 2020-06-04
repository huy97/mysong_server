const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listenHistorySchema = new Schema({
    songId: mongoose.ObjectId,
    artistId: mongoose.ObjectId
}, {
    timestamps: true
});

module.exports = mongoose.model('ListenHistory', listenHistorySchema, 'listen_histories');
