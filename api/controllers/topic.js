const mongoose = require('mongoose')
const { mqtt_client } = require('../utils/mqtt.js')
const eventsModel = require('../models/events.js')
const topicsModel = require('../models/topics.js')
const { storeMessagesToMongo } = require('../utils/helpers.js')

exports.getAllSubscribedTopics = (req, res) => {
  const subscriptions = topicsModel.find()
  .then(subscriptions => {
    res.status(200).json({
      status: "success",
      subscriptions: subscriptions
    })
  })
  .catch(err => {
    console.error(err)
    res.status(500).json({
      status: "failed",
      message: "Error retrieving subscriptions"
    })
  })
}

exports.checkSubscribedTopic = (req, res) => {
  const requestedTopic = req.params.topic

  topicsModel.findOne({ topicName: requestedTopic })
    .then(existingTopic => {
      if (existingTopic) {
        res.status(200).json({
          subscribed: true
        })
      } else {
        res.status(404).json({
          subscribed: false
        })
      }
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({
        status: "failed",
        message: `Error checking subscription for topic ${requestedTopic}`
      })
    })
}

exports.subscribeToTopic = (req, res) => {

  const requestedTopic = req.params.topic

  topicsModel.findOne({ topicName: requestedTopic })
  .then(existingTopic => {
    if (existingTopic) {
      res.status(200).json({
        status: "success",
        message: `Already subscribed to topic ${requestedTopic}`
      })
    }
    else {
      topicsModel.create({ topicName: requestedTopic })
      .then(() => {
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
      })
      .catch(err => {
        console.error(err)
        res.status(500).json({
          status: "failed",
          message: `Error creating entry in topics collection for ${requestedTopic}`
        })
      })
    }
  })
  .catch(err => {
    console.error(err)
    res.status(500).json({
      status: "failed",
      message: `Error checking existing subscriptions for topic ${requestedTopic}`
    })
  })
}