require('dotenv').config()

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken')
const yaml = require('yaml')
const swaggerUi = require('swagger-ui-express')
const fs = require('fs')

const app = express();
const port = process.env.API_PORT || 3001;

const authRoutes = require('./routes/auth.js')
const topicRoutes = require('./routes/topic.js')

const swaggerYamlFile = fs.readFileSync('./swagger.yaml', 'utf8')
const swaggerDocument = yaml.parse(swaggerYamlFile)

app.use(cors());
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET))

const authCheck = (req, res, next) => {
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

app.get('/', (req, res) => res.status(200).send('Black-Relay API server is running.'))

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/auth', authRoutes)
app.use('/topic', authCheck, topicRoutes)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API URL: http://localhost:${port}`);
});
