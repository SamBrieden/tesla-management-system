require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const mongoose = require('mongoose')
const jwt = require('express-jwt')
const PORT = process.env.PORT || 7000

app.use(express.json())
app.use(morgan('dev'))

mongoose.connect('mongodb://localhost:27017/tesla_app', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }, () => {
    console.log('Hi! Whatchya doing?!')
})
app.use('/auth', require('./routes/authRouter.js'))
app.use('/api', jwt({ secret: process.env.SECRET, algorithms: ['HS256']}))
app.use('/api/car', require('./routes/carRouter'))


app.use((err, req, res, next) => {
    console.log(err)
    if(err.name === 'Unauthorized Error') {
        res.status(err.status)
    }
    return res.send({ errMsg: err.message })
})



app.listen(PORT, () => console.log(`Listening to port ${PORT}`))