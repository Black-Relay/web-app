const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET
const rbacGroupsModel = require('../models/rbacGroups.js')

exports.authCheck = (req, res, next) => {
  if(!req.signedCookies.authToken){
    res.status(401).send('No authToken found. Please log in.')
  }
  else{
    try {
      jwt.verify(req.signedCookies.authToken, jwtSecret);
      next();
    }
    catch (err) {
      if (err.name === 'TokenExpiredError') {
        console.error(err.message)
        res.status(403).send('Token expired. Please log in again.');
      } else if (err.name === 'JsonWebTokenError') {
        console.error(err.message)
        res.status(403).send('Invalid token.');
      } else {
        console.error(err.message)
        res.status(500).send('Token verification failed.');
      }
    }
  }
}

exports.adminCheck = (req, res, next) => {
  if(!req.signedCookies.authToken){
    res.status(401).send('No authToken found. Please log in.')
  }
  else{
    try {
      rbacGroupsModel.findOne({ rbacGroupName: 'admin' })
      .then( (group) => {
        jwt.verify(req.signedCookies.authToken, jwtSecret, (err, decoded) => {
          if (err) {
            res.status(403).send('Token verification failed.');
          }
          else if (!decoded.groups || !decoded.groups.includes(String(group._id))) {
            res.status(403).send('User is not an admin.');
          }
          else {
            next();
          }
        });
      })
      .catch( (err) => {
        console.error(err)
        res.status(500).send('Error checking user permissions')
      })
    }
    catch (err) {
      if (err.name === 'TokenExpiredError') {
        console.error(err.message)
        res.status(403).send('Token expired. Please log in again.');
      } else if (err.name === 'JsonWebTokenError') {
        console.error(err.message)
        res.status(403).send('Invalid token.');
      } else {
        console.error(err.message)
        res.status(500).send('Token verification failed.');
      }
    }
  }

}