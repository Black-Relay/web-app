const { faker } = require('@faker-js/faker')
const { sendDummyData } = require('./sendDummyData.js')

exports.sendAccelerometerData = () => {
  const accelerometerData = () => {
    return {
      x: faker.number.float({ min: -16, max: 16, precision: 0.01 }),
      y: faker.number.float({ min: -16, max: 16, precision: 0.01 }),
      z: faker.number.float({ min: -16, max: 16, precision: 0.01 }),
      timestamp: Date.now()
    }
  }

  sendDummyData('accelerometer', accelerometerData, 3600000) // one hour
}