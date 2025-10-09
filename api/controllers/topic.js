const mongoose = require('mongoose')
const { mqtt_client, mqtt_url } = require('../utils/mqtt.js')
const { mongooseConn, db_url } = require('../db.js')
const eventsModel = require('../models/events.js')

const storeMessagesToMongo = (Model, requestedTopic) => {
  mqtt_client.on("message", (topic, message) => {
    if(topic === requestedTopic){
      message = JSON.parse(message.toString())
      Model.create(message)
      .then(messageDoc => {
        eventsModel.create({
          category: "DETECT",
          topic: topic,
          data: messageDoc._id
        })
        .then(eventDoc => eventDoc)
        .catch(err => console.error('Error while saving event document: ', err))
        return messageDoc
      })
      .catch(err => console.error('Error while saving document: ', err))
    }
  })
}

exports.subscribeToTopic = async (req, res) => {

  const requestedTopic = req.params.topic

  mqtt_client.subscribe(requestedTopic, (err) => {
    if (err){
      console.error(err)
      res.status(400).json({
        status: "failed",
        message: `Could not subscribe to topic ${requestedTopic}`
      })
    }

    else{
      mongoose.connection.listCollections()
      .then((collections) => {
        let collectionExists = false
        let Model;
        if(mongoose.models[requestedTopic]){
          Model = mongoose.models[requestedTopic]
        }
        else{
          Model = mongoose.model(requestedTopic, new mongoose.Schema({}, { strict: false }), requestedTopic)
        }

        for (let collection of collections){
          if (collection.name === requestedTopic){
            collectionExists = true
          }
        }

        if (!collectionExists){
          Model.createCollection()
          .then( (collection) => {
            console.log(`Mongo collection ${collection.name} created`)
            return
          })
          .catch(err => console.error(`Unable to create collection for ${requestedTopic}. Error:\n${err}`))
        }

        storeMessagesToMongo(Model, requestedTopic)
        res.status(200).json({
          status: "success",
          message: `Successfully subscribed to topic ${requestedTopic}`
        })
      })
      .catch(err => {
        console.error(err)
        res.status(500).send('Something went wrong listing MongoDB collections')
      })
    }
  })
}

exports.getAllTopicData = (req, res) => {
  try {
    let Model = mongoose.model(req.params.topic)
    Model.find()
    .then(data => res.status(200).send(data))
    .catch(err => res.status(400).send(err))
  }
  catch{
    res.status(500).send(`Unable to get data from topic ${req.params.topic}. Has it been subscribed to?`)
  }
}

exports.getTopicById = (req, res) => {
  // TODO
}