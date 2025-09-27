require('dotenv').config()
const { getRandomNumber } = require('../utils/helpers.js')
const mqtt_url = process.env.MQTT_URL || 'mqtt://localhost:1883'
const mqtt = require("mqtt");
const clientPromise = mqtt.connectAsync(mqtt_url);

// TODO - find a way to send data at random intervals rather than a fixed, regular interval

/**
 * Sends dummy data to MQTT at a regular interval
 * @func sendDummyData
 * @param {string} topic - the MQTT topic to publish to
 * @param {function} generateData - a callback function to generate the data to be sent
 * @param {number} interval - the interval (in milliseconds) in which to randomly generate timeouts to send data. Effectively, this is the shortest interval you would want to wait before receiving data again.
 */
exports.sendDummyData = (topic, generateData, interval) => {

  clientPromise.then((client) => {
    let connectionActive;
    client.connected ? connectionActive = true : connectionActive = false

    const createLogMessage = (message) => {
      try{
        return `${new Date().toISOString()} - ${message}`
      }
      catch{
        return `${new Date().toISOString()} - LOGGING ERROR`
      }
    }

    // Helper function for initializing connection and sending data
    const initialize = () => {

      client.publish(topic, JSON.stringify(generateData())) &&
      console.log(createLogMessage(`Sending dummy data to topic: ${topic}`)) // Send data immediately one time

      // At provided interval, create create a random timeout to send data.
      while(client.connected){
        setTimeout(() => {
          let timeout = getRandomNumber(1000, 86400000) // Between one second and 24 hours
          setTimeout(() => {
            client.publish(topic, JSON.stringify(generateData())) &&
            console.log(createLogMessage(`Sending dummy data to topic: ${topic}`))
          }, timeout)
        }, interval)
      }

      connectionActive = true;
    }

    if (client.connected){
      console.log(createLogMessage('Connected to MQTT server'))
      initialize()
    }

    // Log if connection disconnected (by MQTT server)
    client.on('disconnect', (packet) => {
      if (connectionActive){
        console.log(createLogMessage(`Disconnected by MQTT server:\n${packet}`))
        connectionActive = false;
      }
    })

    // Log if connection closed
    client.on('close', () => {
      if (connectionActive){
        console.log(createLogMessage('Connection to MQTT server closed'))
        connectionActive = false;
      }
    })

    // Reset and continue sending data on reconnection
    client.on('connect', () => {
      console.log(createLogMessage('Reconnected to MQTT server'))
      initialize()
    })
  }
)}