var mongoose = require('mongoose')
var Schema = mongoose.Schema

//password seharus nya di hash bro

module.exports = mongoose.model('Users', new Schema({
    email    : String,
    password : String
}))