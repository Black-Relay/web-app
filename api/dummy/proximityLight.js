const { faker } = require('@faker-js/faker')
const { sendDummyData } = require('./sendDummyData.js')

exports.sendProximityLightData = () => {
  const proximityLightData = () => {
    return {
      sensorId: faker.string.uuid(),
      timestamp: new Date().toISOString(),
      proximity: faker.number.int({ min: 0, max: 100 }), // distance in cm
      lightLevel: faker.number.int({ min: 0, max: 1000 }), // lux
    }
  }

  sendDummyData('proximity_light', proximityLightData, 300000) // 5 minutes
}