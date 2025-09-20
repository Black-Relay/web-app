const { faker } = require('@faker-js/faker')
const { sendDummyData } = require('./sendDummyData.js')

exports.sendAirQualityData = () => {
  const airQualityData = () => {
    return {
      timestamp: new Date().toISOString(),
      sensorId: faker.datatype.uuid(),
      location: {
        latitude: faker.address.latitude(),
        longitude: faker.address.longitude(),
        description: faker.address.cityName()
      },
      pm25: faker.datatype.float({ min: 0, max: 500, precision: 0.1 }), // µg/m³
      pm10: faker.datatype.float({ min: 0, max: 600, precision: 0.1 }), // µg/m³
      co2: faker.datatype.number({ min: 350, max: 2000 }), // ppm
      temperature: faker.datatype.float({ min: -10, max: 40, precision: 0.1 }), // °C
      humidity: faker.datatype.float({ min: 10, max: 90, precision: 0.1 }), // %
      voc: faker.datatype.float({ min: 0, max: 10, precision: 0.01 }) // mg/m³
    }
  }

  sendDummyData('air_quality', airQualityData, 3600000) // one hour
}