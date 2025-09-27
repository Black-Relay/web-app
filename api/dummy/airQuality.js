const { faker } = require('@faker-js/faker')
const { sendDummyData } = require('./sendDummyData.js')

exports.sendAirQualityData = () => {
  const airQualityData = () => {
    return {
      timestamp: new Date().toISOString(),
      sensorId: faker.string.uuid(),
      location: {
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
        description: faker.location.city()
      },
      pm25: faker.number.float({ min: 0, max: 500, precision: 0.1 }), // µg/m³
      pm10: faker.number.float({ min: 0, max: 600, precision: 0.1 }), // µg/m³
      co2: faker.number.int({ min: 350, max: 2000 }), // ppm
      temperature: faker.number.float({ min: -10, max: 40, precision: 0.1 }), // °C
      humidity: faker.number.float({ min: 10, max: 90, precision: 0.1 }), // %
      voc: faker.number.float({ min: 0, max: 10, precision: 0.01 }) // mg/m³
    }
  }

  sendDummyData('air_quality', airQualityData, 3600000) // one hour
}