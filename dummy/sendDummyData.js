require('dotenv').config()
const mqtt_url = process.env.MQTT_URL || 'mqtt://localhost:1883'
const mqtt = require("mqtt");
const clientPromise = mqtt.connectAsync(mqtt_url);

exports.sendDummyData = (topic, data) => {

  clientPromise.then((client) => {

    let seedDataIntervalId;
    let connectionActive;
    client.connected ? connectionActive = true : connectionActive = false

    // Log if connection disconnected (by MQTT server)
    client.on('disconnect', (packet) => {
      if (connectionActive){
        console.log(`${new Date().toISOString()} - Disconnected by MQTT server:\n${packet}`)
        connectionActive = false;
      }
    })

    // Log if connection closed
    client.on('close', () => {
      if (connectionActive){
        console.log(`${new Date().toISOString()} - Connection to MQTT server closed`)
        connectionActive = false;
      }
    })

    // Reset and continue sending data on reconnection
    client.on('connect', () => {
      console.log(`${new Date().toISOString()} - Connected to MQTT server`)

      if (seedDataIntervalId){
        clearInterval(seedDataIntervalId)
      }

      seedDataIntervalId = setInterval(() => {
        client.publish(topic, JSON.stringify(data));
      }, 10000)
      console.log(`${new Date().toISOString()} - Sending dummy data to topic: ${topic}`)

      connectionActive = true;
    })

    // Begin sending data on initial connection
    if (client.connected){
      if (seedDataIntervalId){
        clearInterval(seedDataIntervalId)
      }

      seedDataIntervalId = setInterval(() => {
        client.publish(topic, JSON.stringify(data));
      }, 10000)

      console.log(`${new Date().toISOString()} - Sending dummy data to topic: ${topic}`)
    }

  })
  .catch(err => {
    console.error(err)
  })
}


