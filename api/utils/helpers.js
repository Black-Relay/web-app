const mongoose = require('mongoose')
const { mqtt_client } = require('./mqtt.js')
const eventsModel = require('../models/events.js')
const topicsModel = require('../models/topics.js')

exports.getRandomNumber = (min, max) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

exports.storeMessagesToMongo = (requestedTopic) => {
  return mqtt_client.on("message", (topic, message) => {
    if(topic === requestedTopic){
      message = JSON.parse(message.toString())
      eventsModel.create({
        createdAt: new Date(),
        topic: requestedTopic,
        category: "DETECT",
        data: message
      })
      .then(eventDoc => eventDoc)
      .catch(err => console.error('Error while saving event document: ', err))
    }
  })
}

exports.reSubscribeToTopics = async (skippedCollections) => {
  if(!Array.isArray(skippedCollections)){
    console.error("Parameter provided to reSubscribeToTopics function must be an array.")
    return
  }

  try {
    const subscribedTopics = await topicsModel.distinct("topicName")
    subscribedTopics.forEach(topic => {
      if(!skippedCollections.includes(topic)){
        mqtt_client.subscribe(topic, err => {
          if (err) {
            console.error(`Error re-subscribing to topic ${topic}: `, err)
          }
          else {
            console.log(`Re-subscribed to topic ${topic}`)
            exports.storeMessagesToMongo(topic)
          }
        })
      }
    })
  }

  catch (error) {
    console.error('Error retrieving subscribed topics from MongoDB: ', error)
  }
}