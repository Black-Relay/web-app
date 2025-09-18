const { sendDummyData } = require('./sendDummyData.js')

const motionData = {
  sensorId: "sensor-001",
  timestamp: new Date().toISOString(),
  motionDetected: true,
  location: "Living Room"
}

sendDummyData('motion', motionData)