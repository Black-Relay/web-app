const mongoose = require('mongoose')
const { mqtt_client } = require('../utils/mqtt.js')
const eventsModel = require('../models/events.js')
const { storeMessagesToMongo } = require('../utils/helpers.js')

exports.subscribeToTopic = (req, res) => {

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
      storeMessagesToMongo(requestedTopic)
      res.status(200).json({
          status: "success",
          message: `Successfully subscribed to topic ${requestedTopic}`
      })
    }
  })
}

exports.getAllTopicData = (req, res) => {
  try {
    eventsModel.find({ topic: req.params.topic })
    .then(data => res.status(200).send(data))
    .catch(err => res.status(400).send(err))
  }
  catch{
    res.status(500).send(`Unable to get data from topic ${req.params.topic}. Has it been subscribed to?`)
  }
}

exports.getTopicById = (req, res) => {
  // TODO
  res.status(501).send("Not implemented")
}