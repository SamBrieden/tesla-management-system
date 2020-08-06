const express = require('express')
const axios = require('axios')
const Car = require('../models/car')
const Key = require('../models/key')
const carRouter = express.Router()

carRouter.route('/:keyID/:command')
    .post((req, res, next) => {
        Car.find((err, cars) => {
            if(err) {
                res.status(500)
                return next(err)
            }
            const myCar = cars.find(car => car.active_keys.find(key => key === req.params.keyID))
            if(!myCar){
                res.status(401)
                return next(new Error('Key no longer active'))
            }
            const authAxios = axios.create()
            authAxios.interceptors.request.use(config => {
                config.headers.Authorization = `Bearer ${myCar.active_token}`
                return config
            })
            authAxios.post(`https://owner-api.teslamotors.com/api/1/vehicles/${myCar.car_access_id}/command/${req.params.command}`)
        })
    })

carRouter.route('/load_cars')
        //Use credentials to gain token
        //Use token to access cars
        //Use info on cars to access legacy info

        .post((req, res, next) => {
            console.log(11111111)
            //List all car data
            Car.find((err, cars) => {
                console.log(2222222)
                if(err) {
                    res.status(500)
                    return next(err)
                }
                //Request Credentials
                axios.post('https://owner-api.teslamotors.com/oauth/token',
                    {
                        "grant_type": "password",
                        "client_id": "81527cff06843c8634fdc09e8ac0abefb46ac849f38fe1e431c2ef2106796384",
                        "client_secret": "c7257eb71a564034f9419ee651c7d0e5f7aa6bfbd18bafb5c5c033b093bb2fa3",
                        "email": req.body.email,
                        "password": req.body.password
                    })
                .then(oauthRes => {
                    console.log(3333)
                    //Gain Vehicle Specific IDs 
                    const authAxios = axios.create()
                    authAxios.interceptors.request.use(config => {
                    config.headers.Authorization = `Bearer ${oauthRes.data.access_token}`
                    return config
                    })
                    authAxios.get('https://owner-api.teslamotors.com/api/1/vehicles/')
                    .then(vehicleRes => {
                        console.log(4444)
                        vehicleRes.data.response.forEach(vehicle => {
                            //Request Legacy Data
                            authAxios.get(`https://owner-api.teslamotors.com/api/1/vehicles/${vehicle.id}/data`)
                            .then(legacyRes => {
                                console.log(5555)
                                const carMatch = cars.find(car => car.car_access_id === vehicle.id)
                                if(carMatch){
                                    //Update existing car
                                    const updatedCar = {
                                        email: req.body.email,
                                        password: req.body.password,
                                        master_key_holder: req.body.userEmail,
                                        active_token: oauthRes.data.access_token,
                                        token_expiration: Date.now() + oauthRes.data.expires_in,
                                        car_access_id: vehicle.id,
                                        legacy_data: legacyRes.data.response
                                    }
                                    Car.findByIdAndUpdate({ _id: carMatch._id }, updatedCar, { new: true }, (err, updatedCar) => {
                                        console.log(666666)
                                        if(err){
                                            res.status(500)
                                            return next(err)
                                        }
                                        res.status(200)
                                        return next()
                                    })

                                } else {
                                    console.log(777777, legacyRes.data)
                                    //Save new car
                                    const newCarData = {
                                        email: req.body.email,
                                        password: req.body.password,
                                        master_key_holder: req.body.userEmail,
                                        active_token: oauthRes.data.access_token,
                                        token_expiration: Date.now() + oauthRes.data.expires_in,
                                        car_access_id: vehicle.id,
                                        legacy_data: legacyRes.data.response
                                    }
                                    const newCar = new Car(newCarData)
                                    newCar.save((err, savedCar) => {
                                        if(err){
                                            res.status(500)
                                            next(err)
                                        }
                                        return next()
                                    })
                                }
                            })
                            .catch(err => next(err))
                        })
                    })
                    .catch(err => next(err))
                })
                .catch(err => next(err))
            })
        })


module.exports = carRouter