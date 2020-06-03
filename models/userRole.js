const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userRoleSchema = new Schema({
    userId: mongoose.ObjectId,
    roleId: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('UserRole', userRoleSchema, 'user_roles');
