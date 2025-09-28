require('dotenv').config()
const { getRandomNumber } = require('../utils/helpers.js')
const mqtt_url = process.env.MQTT_URL || 'mqtt://localhost:1883'
const mqtt = require("mqtt");
const clientPromise = mqtt.connectAsync(mqtt_url);

// TODO - find a way to send data at random intervals rather than a fixed, regular interval

/**
 * Sends dummy data to MQTT at a regular interval
 * @func sendDummyData
 * @param {string} topic - The MQTT topic to publish to
 * @param {function} generateData - A callback function to generate the data to be sent
 * @param {number} maxInterval - The maximum interval to wait for data to be sent. Data is sent at random intervals between 1 second and this value.
 */
exports.sendDummyData = (topic, generateData, maxInterval) => {

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

    const sendData = () => {
      client.publish(topic, JSON.stringify(generateData()))
      console.log(createLogMessage(`Sending dummy data to topic: ${topic}`)) // Send data immediately one time
    }

    // At provided interval, create create a random timeout to send data.
    const loop = () => {
      let randomInterval = getRandomNumber(1000, maxInterval)
      setTimeout(() => {
        sendData()
        loop()
      }, randomInterval)
    }

    const initialize = () => {
      sendData()
      loop()
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