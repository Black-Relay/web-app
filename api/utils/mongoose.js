const mongoose = require('mongoose')
const { mqtt_client } = require('./mqtt.js')

exports.reSubscribeToTopics = (skippedCollections) => {
  if(!Array.isArray(skippedCollections)){
    console.error("Parameter provided to reSubscribeToTopics function must be an array.")
    return
  }

  mongoose.connection.listCollections()
  .then((collections) => {
    for (let collection of collections){
      if(skippedCollections.includes(collection.name)){
        continue
      }
      else{
        // Check if mongoose model already exists, otherwise create it
        let Model;
        if(mongoose.models[collection.name]){
          Model = mongoose.models[collection.name]
        }
        else{
          Model = mongoose.model(collection.name, new mongoose.Schema({}, { strict: false }), collection.name)
        }

        mqtt_client.subscribe(collection.name, (err) => {
          if (err){
            console.error(`Unable to re-subscribe to topic ${collection.name}:\n${err}`)
          }
          else{
            console.log(`Re-subscribing to topic ${collection.name}...`)
            mqtt_client.on("message", (topic, message) => {
              if(topic === collection.name){
                message = JSON.parse(message.toString())
                Model.create(message)
                .then(doc => doc)
                .catch(err => console.error('Error while saving document: ', err))
              }
            })
          }
        })
      }
    }
  })
}