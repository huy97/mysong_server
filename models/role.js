const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
    roleId: Number,
    roleDescription: {type: String, default: ""},
    permissionCodes: {type: Array, default: []}
}, {
    timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);
