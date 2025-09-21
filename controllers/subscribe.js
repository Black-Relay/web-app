const mqtt_url = process.env.MQTT_URL || 'mqtt://localhost:1883'
const mqtt = require("mqtt")
const mqtt_client = mqtt.connect(mqtt_url)
const mongoose = require('mongoose');
const mongo_host = process.env.MONGO_HOST || 'localhost'
const db = process.env.DB_NAME || 'black-relay'
const mongo_user = process.env.MONGO_USER || 'admin'
const mongo_pass = process.env.MONGO_PASS || 'password'
const db_url = `mongodb://${mongo_user}:${mongo_pass}@${mongo_host}:27017/${db}?authSource=admin`

mongoose.connect(db_url)
.then(() => console.log(`Connected to MongoDB at URL ${db_url}`))
.catch((err) => console.error(`Unable to connect to MongoDB at URL ${db_url}. Message:\n${err}`))

mqtt_client.on("connect", () => {
  console.log(`Server connected to MQTT server at URL ${mqtt_url}`)
})

// TODO - add error handling for if topic is already subscribed to
exports.subscribeToTopic = async (req, res) => {

  const requestedTopic = req.params.topic

  const subscribed = await mongoose.connection.listCollections()
  .then(collections => {
    for (let collection of collections){
      // Add 's' for comparison since MongoDB adds an 's' to all collection names
      if (collection.name ===  (requestedTopic + 's')){
        res.status(409).json({
          "status": "failed",
          "message": `Already subscribed to topic ${requestedTopic}`
        })
        return true
      }
    }
    return false
  })

  if (!subscribed){
    mqtt_client.subscribe(requestedTopic, (err) => {
      if (err){
        console.error(err)
        res.status(400).json({
          status: "failed",
          message: `Could not subscribe to topic ${requestedTopic}`
        })
      }
      else{
        const Model = mongoose.model(requestedTopic, new mongoose.Schema({}, { strict: false }))
        Model.createCollection()
        .then( (collection) => {
          console.log(`Mongo collection ${collection} created`)
          console.log(`Subscribed to topic ${requestedTopic}`)
          res.status(200).json({
            status: "success",
            message: `Successfully subscribed to topic ${requestedTopic}`
          })
        })
        .catch(err => console.error(`Unable to create collection for ${requestedTopic}. Error:\n${err}`))
        mqtt_client.on("message", (topic, message) => {
          if(topic === requestedTopic){
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

}