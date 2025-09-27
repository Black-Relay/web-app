const { faker } = require('@faker-js/faker')
const { sendDummyData } = require('./sendDummyData.js')

exports.sendMotionData = () => {
  const motionData = () => {
    return {
      sensorId: faker.number.int({ min: 101, max: 999}),
      timestamp: new Date().toISOString(),
      motionDetected: true,
      direction: faker.location.direction({ abbreviated: true }),
      location: faker.location.nearbyGPSCoordinate()
    }
  }

  sendDummyData('motion', motionData, 10000) // ten seconds
}