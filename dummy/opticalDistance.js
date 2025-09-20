const { faker } = require('@faker-js/faker')
const { sendDummyData } = require('./sendDummyData.js')

exports.sendOpticalDistanceData = () => {
  const opticalDistanceData = () => {
    return {
      sensorId: faker.datatype.uuid(),
      timestamp: new Date().toISOString(),
      distance_mm: faker.datatype.number({ min: 20, max: 4000 }),
      status: faker.helpers.arrayElement(['OK', 'OUT_OF_RANGE', 'ERROR']),
    }
  }

  sendDummyData('optical_distance', opticalDistanceData, 3600000) // one hour
}