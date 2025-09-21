const mongoose = require('mongoose')
const { mqttClient, mqtt_url } = require('../mqtt/mqttClient.js')
const { mongooseConn, db_url } = require('../mongoose/mongooseConn.js')


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
    mqttClient.subscribe(requestedTopic, (err) => {
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
        mqttClient.on("message", (topic, message) => {
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