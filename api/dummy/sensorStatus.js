const { faker } = require("@faker-js/faker");
const { sendDummyData } = require("./sendDummyData.js");

exports.sendSensorStatusData = () => {
  const sensorStatusData = () => {
    return {
      Sensor_ID: `Edge_1`,
      "Sensor-type": "Environment",
      LAT: faker.location.latitude({ origin: [35.7796, 78.6382] }),
      LON: faker.location.longitude({ origin: [35.7796, 78.6382] }),
      Fix: 0,
      Sats: 0,
      "Temp Fahrenheit": faker.number.float({ fractionDigits: 3 }),
      "Air Quality": faker.number.int({ min: 0, max: 350 }),
    };
  };

  sendDummyData("sensor_status", sensorStatusData, 300000); // 5 minutes
};
