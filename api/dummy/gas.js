const { faker } = require('@faker-js/faker')
const { sendDummyData } = require('./sendDummyData.js')

exports.sendGasData = () => {
  const gasData = () => {
    return {
      timestamp: Date.now(),
      sensorId: faker.string.uuid(),
      co2: faker.number.int({ min: 350, max: 2000 }), // ppm
      voc: faker.number.int({ min: 0, max: 500 }),    // ppb
    }
  }

  sendDummyData('gas', gasData, 300000) // 5 minutes
}