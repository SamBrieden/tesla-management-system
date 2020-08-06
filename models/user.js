const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    my_keys: {
        type: [String],
        default: []
    }
})

UserSchema.pre('save', function(next) {
    const user = this
    if(!user.isModified('password')) return next()
    bcrypt.hash(user.password, 10, (err, hash) => {
        if(err) return next(err)
        user.password = hash
        return next()
    })
})

UserSchema.methods.checkPassword = function(passwordAttempt, callBack) {
    const user = this.toObject()
    bcrypt.compare(passwordAttempt, user.password, (err, isMatch) => {
        if(err) return callBack(err)
        return callBack(null, isMatch)
    })
}

UserSchema.methods.withoutPassword = function() {
    const user = this.toObject()
    delete user.password
    return user
}

module.exports = mongoose.model('User', UserSchema)