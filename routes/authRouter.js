const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user.js')
const authRouter = express.Router()

authRouter.post('/create_account', (req, res, next) => {
    User.findOne({ email: req.body.email.toLowerCase() }, (err, user) => {
        if(err) {
            res.status(500)
            return next(err)
        }
        if(user){
            res.status(403)
            return next(new Error('Email is already in use'))
        }
        const newUser = new User(req.body)
        newUser.save((err, savedUser) => {
            if(err) {
                res.status(500)
                return next(err)
            }
            const token = jwt.sign(savedUser.withoutPassword(), process.env.SECRET)  
            return res.status(200).send({token, user: savedUser.withoutPassword()})
        })
    })
})

authRouter.post('/login', (req, res, next) => {
    User.findOne({ email: req.body.email.toLowerCase() }, (err, user) => {
        if(err) {
            res.status(500)
            return next(err)
        }
        if(!user){
            res.status(401)
            return next(new Error('Email or password is incorrect'))
        }
        user.checkPassword(req.body.password, (err, isMatch) => {
            if(err) {
                res.status(500)
                return next(err)
            }
            if(!isMatch){
                res.status(401)
                return next(new Error('Email or password is incorrect'))
            }
            const token = jwt.sign(user.withoutPassword(), process.env.SECRET)
            return res.status(200).send({ token, user: user.withoutPassword() })
        })
    })
})

module.exports = authRouter