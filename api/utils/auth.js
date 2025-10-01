const jwt = require('jsonwebtoken')

exports.authCheck = (req, res, next) => {
  if(!req.signedCookies.authToken){
    res.status(401).send('No authToken found. Please log in.')
  }
  else{
    try {
      jwt.verify(req.signedCookies.authToken, process.env.JWT_SECRET);
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