const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const { mongooseConn } = require('../db.js')
const usersModel = require('../models/users.js')
const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET

exports.userLogin = (req, res) => {
  if(!req.body){
    res.status(400).send('You must supply a body with this request')
  }
  else if(!Object.hasOwn(req.body, 'username') || !Object.hasOwn(req.body, 'password')){
    res.status(400).send('Incorrect properties supplied')
  }
  else{
    const reqBody = req.body
    usersModel.findOne({ username: reqBody.username })
    .then(user => {
      if (!user){
        // No user found with provided username
        res.status(401).send(`Login failed`)
      }
      else if (user.length){
        res.status(500).send(`Multiple users found with username ${reqBody.username}. This should not be possible.`)
      }
      else if (user){
        bcrypt.compare(reqBody.password, user.password)
        .then((correctPassword) => {
          if (correctPassword){
            // generate JWT
            userData = {
              "firstName": user.firstName,
              "lastName": user.lastName,
              "groups": user.groups,
              "user_id": user._id
            }
            let token = jwt.sign(userData, jwtSecret, { expiresIn: '1h' })

            // Set cookie with JWT
            res.cookie('authToken', token, {
              httpOnly: true,
              signed: true,
              domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : 'localhost'
            })
            res.status(200).send(userData)
          }
          else{
            // Incorrect password provided
            res.status(401).send('Login failed')
          }
        })
        .catch((err) => console.error(err) && res.status(500).send(err))
      }
    })
    .catch(err => res.status(500).send(err))
  }
}

exports.userLogout = (req, res) => {
  try{
    res.clearCookie('authToken')
    res.status(200).json({ success: "true" })
  }
  catch (err) {
    console.error(`Logout error:\n${err}`)
    res.status(500).json({
      success: "false",
      message: "Something went wrong during logout. Are you already logged out?"
    })
  }
}