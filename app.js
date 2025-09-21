require('dotenv').config()
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.API_PORT || 3001;
const subscribeRoutes = require('./routes/subscribe.js')
const authRoutes = require('./routes/auth.js')

const mqtt_url = process.env.MQTT_URL || 'mqtt://localhost:1883'
const mqtt = require("mqtt")
const mqttClient = mqtt.connect(mqtt_url)

const mongoose = require('mongoose');
const mongo_host = process.env.MONGO_HOST || 'localhost'
const db = process.env.DB_NAME || 'black-relay'
const mongo_user = process.env.MONGO_USER || 'admin'
const mongo_pass = process.env.MONGO_PASS || 'password'
const db_url = `mongodb://${mongo_user}:${mongo_pass}@${mongo_host}:27017/${db}?authSource=admin`
const mongooseConn = mongoose.connect(db_url)
.then(() => console.log(`Connected to MongoDB at URL ${db_url}`))
.catch((err) => console.error(`Unable to connect to MongoDB at URL ${db_url}. Message:\n${err}`))

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
    catch (error) {
      if (error.name === 'TokenExpiredError') {
        res.status(403).send('Token expired. Please log in again.');
      } else if (error.name === 'JsonWebTokenError') {
        res.status(403).send('Invalid token.');
      } else {
        res.status(500).send('Token verification failed.');
      }
    }
  }
}

app.get('/', (req, res) => res.status(200).send('Black-Relay API server is running.'))

// app.use('/auth', authRoutes)
app.use('/subscribe', subscribeRoutes)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API URL: http://localhost:${port}`);
});

module.exports = [
  mongooseConn,
  mqttClient
]