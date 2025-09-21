const mqtt_url = process.env.MQTT_URL || 'mqtt://localhost:1883'
const mqtt = require("mqtt")
const mqttClient = mqtt.connect(mqtt_url)

// TODO - modularize logic from sendDummyData
mqttClient.on("connect", () => {
  console.log(`Server connected to MQTT server at URL ${mqtt_url}`)
})

module.exports = {
  mqtt_url,
  mqttClient
}