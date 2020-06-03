const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const historyListenSchema = new Schema({
    songId: mongoose.ObjectId,
    artistId: mongoose.ObjectId
}, {
    timestamps: true
});

module.exports = mongoose.model('HistoryListen', historyListenSchema, 'histories_listen');
