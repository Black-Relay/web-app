const { faker } = require('@faker-js/faker')
const { sendDummyData } = require('./sendDummyData.js')

exports.sendProximityLightData = () => {
  const proximityLightData = () => {
    return {
      sensorId: faker.datatype.uuid(),
      timestamp: new Date().toISOString(),
      proximity: faker.datatype.number({ min: 0, max: 100 }), // distance in cm
      lightLevel: faker.datatype.number({ min: 0, max: 1000 }), // lux
    }
  }

  sendDummyData('proximity_light', proximityLightData, 3600000) // one hour
}