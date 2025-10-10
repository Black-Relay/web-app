const { mqtt_client } = require('./mqtt.js')
const eventsModel = require('../models/events.js')

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