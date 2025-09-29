const { sendDummyData } = require('./sendDummyData.js')
const { generateKismetData } = require('./helpers/generateKismet.js')

exports.sendKismetData = () => {
  const kismetData = () => {
    return generateKismetData({
      numAccessPoints: 5,
      numClients: 10,
      numBluetoothDevices: 3
    })
  };

  sendDummyData('kismet', kismetData, 300000) // 5 minutes
}