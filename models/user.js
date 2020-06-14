const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullName: {type: String, default: ""},
    username: {type: String, default: "", unique: true},
    password: {type: String, default: ""},
    accessToken: {type: String, default: ""},
    avatar: {type: String, default: ""},
    isVip: {type: Boolean, default: false},
    startVipAt: {type: Number, default: 0},
    isDelete: {type: Boolean, default: false},
}, {
    timestamps: true
});

userSchema.index({
    username: 'text',
    fullName: 'text',
}, {
    weights: {
        username: 1,
        fullName: 1,
    },
});

module.exports = mongoose.model('User', userSchema);
