const mongoose = require('mongoose')
const KeySchema = require('./key.js')

const CarSchema = new mongoose.Schema({
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
    master_key_holder: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    active_keys: {
        type: [String],
        default: []
    },
    active_token: {
        type: String,
        default: 'missing token'
    },
    token_expiration: {
        type: Number,
        default: 1596648794
    },
    car_access_id: {
        type: Number,
        required: true
    },
    legacy_data: {
        type: Object
    }
})

module.exports = mongoose.model('Car', CarSchema)