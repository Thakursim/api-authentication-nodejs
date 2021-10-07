const express = require('express')
const bcrypt = require("bcrypt")
const router = express.Router()
const User = require('../models/user')
const rounds = 10
const middleware = require('../middleware')

const jwt = require('jsonwebtoken')
const tokenSecret = 'my-token-secret'

const token_validity = {
    access: "1d",
    refresh: "7d"
}

router.get('/jwt-test', middleware.verify, (req, res) => {
    res.status(200).json(req.user)
})

router.get('/refresh-token', middleware.verify, (req, res) => {
    const user = req.user
    res.status(200).json({access_token: access_token(user), refresh_token: refresh_token(user)})
})

router.get('/login', (req, res) => {
    User.findOne({email: req.body.email})
    .then(user => {
        if(!user) res.status(404).json({error: 'No user with that email found'})
        else {
            bcrypt.compare(req.body.password, user.password, (error, match)=> {
                if (error) res.status(500).json(error)
                // else if (match) res.status(200).json({token: generateToken(user)})
                else if (match) res.status(200).json({access_token: generateToken(user, token_validity.access), refresh_token: generateToken(user, token_validity.refresh)})
                else res.status(403).json({error: 'password do not match'})
            })
        }
    })
    .catch(error => {
        res.status(500).json(error)
    })

});

router.post('/signup', (req, res) => {
    bcrypt.hash(req.body.password, rounds, (error, hash) =>{
        if (error) res.status(500).json(error)
        else {
            const newUser = User({email: req.body.email, password: hash})
            newUser.save()
                .then(user => {
                    res.status(200).json({access_token: generateToken(user, token_validity.access), refresh_token: generateToken(user, token_validity.refresh)})
                })
                .catch(error => {
                    res.status(500).json(error)
                })
        }
    })
});

function generateToken(user, valid_till){
    return jwt.sign({data: user}, tokenSecret, {expiresIn: valid_till})
}

module.exports = router