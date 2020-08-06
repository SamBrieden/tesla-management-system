const mongoose = require('mongoose')
const keySchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    restrictions:{
        type: [String],
        default: []
    },
    date: {
        type: Date,
        default: Date.now
    },
    expiration_date: {
        type: Number,
        default: 1596648794
    }
})

module.exports = mongoose.model('Key', keySchema)