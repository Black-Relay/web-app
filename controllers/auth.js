const bcrypt = require('bcrypt')
const db = require('../db.js')
const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET

exports.userLogin = (req, res) => {
  if(!req.body){
    res.status(400).send('You must supply a body with this request')
  }
  else if(!Object.hasOwn(req.body, 'username' || !Object.hasOwn(req.body, 'password'))){
    res.status(400).send('Incorrect properties supplied')
  }
  else{
    // TODO - refactor to use mongoose
    db.select('*').from('users').where({ username: req.body.username })
    .then(user => {
      if (user.length === 0){
        res.status(404).send(`No user found with username ${req.params.username}`)
      }
      else if (user.length > 1){
        res.status(500).send(`Multiple users found with username ${req.params.username}. This should not be possible.`)
      }
      else if (user.length === 1){
        let thisUser = user[0]
        bcrypt.compare(req.body.password, thisUser.password)
        .then((correctPassword) => {
          if (correctPassword){
            // generate JWT
            userData = {
              "first_name": thisUser.first_name,
              "last_name": thisUser.last_name,
              "user_id": thisUser.user_id
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