const { faker } = require('@faker-js/faker')
const { sendDummyData } = require('./sendDummyData.js')

exports.sendGasData = () => {
  const gasData = () => {
    return {
      timestamp: Date.now(),
      sensorId: faker.datatype.uuid(),
      co2: faker.datatype.number({ min: 350, max: 2000 }), // ppm
      voc: faker.datatype.number({ min: 0, max: 500 }),    // ppb
    }
  }

  sendDummyData('gas', gasData, 3600000) // one hour
}