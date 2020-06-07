require('dotenv').config();
const mongoose = require('mongoose');
const faker = require('faker');

const mediaSchema = new mongoose.Schema({
    fullName: {type: String, default: ""},
    username: {type: String, default: ""},
    password: {type: String, default: ""},
    accessToken: {type: String, default: ""},
    avatar: {type: String, default: ""},
    isVip: {type: Boolean, default: false},
    startVipAt: {type: Number, default: 0},
    isDelete: {type: Boolean, default: false},
}, {
    timestamps: true
});
const Song = mongoose.model('SongLike', mediaSchema, 'users');

let items = [];

for(let i = 0; i < 300000; i++){
    items.push(
        {
            "fullName": faker.name.firstName() + ' ' + faker.name.lastName(),
            "username": faker.lorem.word()
        }
    )
}
console.time();
Song.insertMany(items, (err) => {
    if(!err) console.log('Success');
    console.timeEnd();
});

mongoose.connect(`mongodb://localhost:27017/mysong`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

