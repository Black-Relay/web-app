const mqtt_url = process.env.MQTT_URL || 'mqtt://localhost:1883'
const mqtt = require("mqtt")
const mqtt_client = mqtt.connect(mqtt_url)
const mongoose = require('mongoose');
const mongo_host = process.env.MONGO_HOST || 'localhost'
const db = process.env.DB_NAME || 'mqtt-to-mongodb'
const mongo_user = process.env.MONGO_USER || 'admin'
const mongo_pass = process.env.MONGO_PASS || 'password'
const db_url = `mongodb://${mongo_user}:${mongo_pass}@${mongo_host}:27017/${db}?authSource=admin`

mongoose.connect(db_url)
.then(() => console.log(`Connected to MongoDB at URL ${db_url}`))
.catch((err) => console.error(`Unable to connect to MongoDB at URL ${db_url}. Message:\n${err}`))

mqtt_client.on("connect", () => {
  console.log(`Server connected to MQTT server at URL ${mqtt_url}`)
})

exports.subscribeToTopic = (req, res) => {
  mqtt_client.subscribe(req.params.topic, (err) => {
    if (err){
      console.error(err)
      res.status(404).json({
        status: "failed",
        message: `Could not subscribe to topic ${req.params.topic}`
      })
    }
    else{
      const Col = mongoose.model(req.params.topic, new mongoose.Schema({}, { strict: false }))
      Col.createCollection()
      .then( (collection) => {
        console.log(`Mongo collection ${collection} created`)
        console.log(`Subscribed to topic ${req.params.topic}`)
        res.status(200).json({
          status: "success",
          message: `Successfully subscribed to topic ${req.params.topic}`
        })
      })
      .catch(err => console.error(`Unable to create collection for ${req.params.topic}. Error:\n${err}`))
      mqtt_client.on("message", (topic, message) => {
        if(topic === req.params.topic){
          message = JSON.parse(message.toString())
          console.log(message)
          Col.create(message)
          .then(doc => console.log('Document saved: ', doc))
          .catch(err => console.error('Error while saving document: ', err))
        }
      })
    }
  })
}