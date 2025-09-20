const { faker } = require('@faker-js/faker');

// Wi-Fi channels and their frequencies (MHz)
const WIFI_CHANNELS = {
  1: 2412000, 6: 2437000, 11: 2462000, 36: 5180000,
  40: 5200000, 44: 5220000, 48: 5240000, 149: 5745000,
  153: 5765000, 157: 5785000, 161: 5805000
};

// Common router manufacturers and their OUIs
const ROUTER_MANUFACTURERS = [
  { name: 'Cisco Systems', oui: 'AA:BB:CC' },
  { name: 'Netgear', oui: '2C:3E:CF' },
  { name: 'TP-Link Technologies', oui: 'F4:F2:6D' },
  { name: 'Linksys', oui: '48:F8:B3' },
  { name: 'D-Link Corporation', oui: '90:94:E4' },
  { name: 'ASUS', oui: 'AC:9E:17' }
];

// Common device manufacturers
const DEVICE_MANUFACTURERS = [
  { name: 'Apple Inc', oui: '3C:15:C2' },
  { name: 'Samsung Electronics', oui: 'B4:62:93' },
  { name: 'Google Inc', oui: 'DA:A1:19' },
  { name: 'Intel Corporation', oui: '94:65:9C' },
  { name: 'Qualcomm', oui: '00:03:7F' },
  { name: 'Broadcom', oui: 'B8:27:EB' }
];

// Bluetooth manufacturers (company IDs)
const BT_MANUFACTURERS = {
  76: 'Apple Inc',
  117: 'Samsung Electronics Co. Ltd.',
  15: 'Qualcomm Technologies Inc.',
  6: 'Microsoft',
  224: 'Google'
};

function generateMacAddress(oui = null) {
  if (oui) {
    return `${oui}:${faker.string.hexadecimal({ length: 2, prefix: '' })}:${faker.string.hexadecimal({ length: 2, prefix: '' })}:${faker.string.hexadecimal({ length: 2, prefix: '' })}`.toUpperCase();
  }
  return faker.internet.mac(':').toUpperCase();
}

function generateLocation() {
  const lat = faker.location.latitude({ min: 25, max: 49 }); // Continental US
  const lon = faker.location.longitude({ min: -125, max: -66 });
  const alt = faker.number.float({ min: 0, max: 1000, fractionDigits: 1 });

  return {
    "kismet.common.location.lat": lat,
    "kismet.common.location.lon": lon,
    "kismet.common.location.alt": alt,
    "kismet.common.location.fix": 3
  };
}

function generateSignalData(includeLocation = true) {
  const signal = faker.number.int({ min: -90, max: -20 });
  const noise = -95;
  const minSignal = signal - faker.number.int({ min: 5, max: 25 });
  const maxSignal = signal + faker.number.int({ min: 5, max: 15 });

  const signalData = {
    "kismet.common.signal.type": "dbm",
    "kismet.common.signal.last_signal": signal,
    "kismet.common.signal.last_noise": noise,
    "kismet.common.signal.min_signal": minSignal,
    "kismet.common.signal.max_signal": maxSignal
  };

  if (includeLocation) {
    signalData["kismet.common.signal.peak_loc"] = generateLocation();
  }

  return signalData;
}

function generateTimeRange() {
  const endTime = faker.date.recent({ days: 1 }).getTime() / 1000;
  const startTime = endTime - faker.number.int({ min: 300, max: 7200 }); // 5min to 2hrs

  return {
    first_time: Math.floor(startTime),
    last_time: Math.floor(endTime),
    mod_time: Math.floor(endTime)
  };
}

function generateWiFiAccessPoint() {
  const manufacturer = faker.helpers.arrayElement(ROUTER_MANUFACTURERS);
  const mac = generateMacAddress(manufacturer.oui);
  const times = generateTimeRange();
  const totalPackets = faker.number.int({ min: 500, max: 5000 });
  const dataPackets = faker.number.int({ min: Math.floor(totalPackets * 0.6), max: Math.floor(totalPackets * 0.9) });
  const llcPackets = faker.number.int({ min: Math.floor(totalPackets * 0.7), max: totalPackets - 10 });
  const errorPackets = faker.number.int({ min: 0, max: Math.floor(totalPackets * 0.05) });
  const dataSize = faker.number.int({ min: 50000, max: 500000 });

  const ssid = faker.helpers.arrayElement([
    faker.internet.domainWord(),
    `${faker.person.firstName()}_WiFi`,
    `${faker.company.name().replace(/[^a-zA-Z0-9]/g, '')}_Guest`,
    'NETGEAR' + faker.number.int({ min: 10, max: 99 }),
    'Linksys' + faker.string.alphanumeric(4),
    faker.hacker.noun() + '_network'
  ]);

  // Generate frequency map (which channels this AP was seen on)
  const channels = faker.helpers.arrayElements(Object.keys(WIFI_CHANNELS), { min: 1, max: 3 });
  const freqMap = {};
  channels.forEach(channel => {
    freqMap[WIFI_CHANNELS[channel]] = faker.number.int({ min: 50, max: Math.floor(totalPackets / 2) });
  });

  // Generate some associated clients
  const numClients = faker.number.int({ min: 0, max: 8 });
  const associatedClients = {};
  for (let i = 0; i < numClients; i++) {
    const clientManufacturer = faker.helpers.arrayElement(DEVICE_MANUFACTURERS);
    const clientMac = generateMacAddress(clientManufacturer.oui);
    const clientPackets = faker.number.int({ min: 10, max: 200 });

    associatedClients[clientMac] = {
      "dot11.client.mac": clientMac,
      "dot11.client.first_time": times.first_time + faker.number.int({ min: 0, max: 300 }),
      "dot11.client.last_time": times.last_time - faker.number.int({ min: 0, max: 300 }),
      "dot11.client.packets": clientPackets,
      "dot11.client.datasize": faker.number.int({ min: 1000, max: 20000 })
    };
  }

  return {
    "kismet.device.base.macaddr": mac,
    "kismet.device.base.name": ssid,
    "kismet.device.base.type": "Wi-Fi AP",
    "kismet.device.base.basictype": "ap",
    "kismet.device.base.phyname": "IEEE802.11",
    "kismet.device.base.devicetag": 0,
    "kismet.device.base.manuf": manufacturer.name,
    "kismet.device.base.first_time": times.first_time,
    "kismet.device.base.last_time": times.last_time,
    "kismet.device.base.mod_time": times.mod_time,
    "kismet.device.base.packets.total": totalPackets,
    "kismet.device.base.packets.llc": llcPackets,
    "kismet.device.base.packets.error": errorPackets,
    "kismet.device.base.packets.data": dataPackets,
    "kismet.device.base.datasize": dataSize,
    "kismet.device.base.signal": generateSignalData(true),
    "kismet.device.base.freq_khz_map": freqMap,
    "kismet.device.base.location": {
      "kismet.common.location.avg_loc": generateLocation(),
      "kismet.common.location.min_loc": generateLocation(),
      "kismet.common.location.max_loc": generateLocation()
    },
    "dot11.device": {
      "dot11.device.last_beaconed_ssid": ssid,
      "dot11.device.last_probed_ssid": "",
      "dot11.device.beacon_info": ssid,
      "dot11.device.ssid_map": {
        [ssid]: {
          "dot11.advertisedssid.ssid": ssid,
          "dot11.advertisedssid.ssidlen": ssid.length,
          "dot11.advertisedssid.beacon_info": ssid,
          "dot11.advertisedssid.crypt_set": faker.helpers.arrayElement([0, 2, 14, 30]), // None, WEP, WPA, WPA2
          "dot11.advertisedssid.first_time": times.first_time,
          "dot11.advertisedssid.last_time": times.last_time,
          "dot11.advertisedssid.beacon_rate": faker.number.int({ min: 5, max: 20 }),
          "dot11.advertisedssid.maxrate": faker.helpers.arrayElement([11.0, 54.0, 150.0, 300.0, 600.0]),
          "dot11.advertisedssid.dot11e_qbss": 0,
          "dot11.advertisedssid.dot11e_qbss_stations": 0,
          "dot11.advertisedssid.channel": channels[0],
          "dot11.advertisedssid.ht_cc": faker.helpers.arrayElement([1, 2]),
          "dot11.advertisedssid.ht_center_1": parseInt(channels[0])
        }
      },
      "dot11.device.associated_client_map": associatedClients,
      "dot11.device.num_fragments": faker.number.int({ min: 0, max: 10 }),
      "dot11.device.num_retries": faker.number.int({ min: 5, max: 50 }),
      "dot11.device.datasize": dataSize,
      "dot11.device.last_sequence": faker.number.int({ min: 1000, max: 9999 })
    }
  };
}

function generateWiFiClient() {
  const manufacturer = faker.helpers.arrayElement(DEVICE_MANUFACTURERS);
  const mac = generateMacAddress(manufacturer.oui);
  const times = generateTimeRange();
  const totalPackets = faker.number.int({ min: 20, max: 500 });
  const dataPackets = faker.number.int({ min: Math.floor(totalPackets * 0.6), max: Math.floor(totalPackets * 0.9) });
  const llcPackets = faker.number.int({ min: Math.floor(totalPackets * 0.7), max: totalPackets - 5 });
  const errorPackets = faker.number.int({ min: 0, max: Math.floor(totalPackets * 0.1) });
  const dataSize = faker.number.int({ min: 1000, max: 50000 });

  const deviceName = faker.helpers.arrayElement([
    `${manufacturer.name.split(' ')[0]} Device`,
    faker.person.firstName() + "'s " + faker.helpers.arrayElement(['Phone', 'Laptop', 'Tablet']),
    faker.hacker.noun(),
    'Unknown Device'
  ]);

  // Generate BSSID (AP this client is connected to)
  const bssidManufacturer = faker.helpers.arrayElement(ROUTER_MANUFACTURERS);
  const bssid = generateMacAddress(bssidManufacturer.oui);

  const channel = faker.helpers.arrayElement(Object.keys(WIFI_CHANNELS));
  const freqMap = {};
  freqMap[WIFI_CHANNELS[channel]] = totalPackets;

  return {
    "kismet.device.base.macaddr": mac,
    "kismet.device.base.name": deviceName,
    "kismet.device.base.type": "Wi-Fi Device",
    "kismet.device.base.basictype": "client",
    "kismet.device.base.phyname": "IEEE802.11",
    "kismet.device.base.devicetag": 0,
    "kismet.device.base.manuf": manufacturer.name,
    "kismet.device.base.first_time": times.first_time,
    "kismet.device.base.last_time": times.last_time,
    "kismet.device.base.mod_time": times.mod_time,
    "kismet.device.base.packets.total": totalPackets,
    "kismet.device.base.packets.llc": llcPackets,
    "kismet.device.base.packets.error": errorPackets,
    "kismet.device.base.packets.data": dataPackets,
    "kismet.device.base.datasize": dataSize,
    "kismet.device.base.signal": generateSignalData(true),
    "kismet.device.base.freq_khz_map": freqMap,
    "dot11.device": {
      "dot11.device.last_beaconed_ssid": "",
      "dot11.device.last_probed_ssid": faker.helpers.arrayElement([
        faker.internet.domainWord(),
        "linksys",
        "NETGEAR",
        "Guest_Network",
        ""
      ]),
      "dot11.device.ssid_map": {},
      "dot11.device.associated_client_map": {},
      "dot11.device.num_fragments": faker.number.int({ min: 0, max: 5 }),
      "dot11.device.num_retries": faker.number.int({ min: 0, max: 20 }),
      "dot11.device.datasize": dataSize,
      "dot11.device.last_sequence": faker.number.int({ min: 100, max: 9999 }),
      "dot11.device.client_map": {
        [bssid]: {
          "dot11.client.bssid": bssid,
          "dot11.client.first_time": times.first_time,
          "dot11.client.last_time": times.last_time,
          "dot11.client.packets": totalPackets,
          "dot11.client.datasize": dataSize,
          "dot11.client.eap_identity": ""
        }
      }
    }
  };
}

function generateBluetoothDevice() {
  const mac = generateMacAddress();
  const times = generateTimeRange();
  const totalPackets = faker.number.int({ min: 5, max: 100 });
  const dataSize = faker.number.int({ min: 100, max: 5000 });
  const manufacturerId = faker.helpers.objectKey(BT_MANUFACTURERS);
  const manufacturerName = BT_MANUFACTURERS[manufacturerId];

  const deviceName = faker.helpers.arrayElement([
    faker.person.firstName() + "'s " + faker.helpers.arrayElement(['iPhone', 'AirPods', 'Watch', 'Headphones']),
    faker.company.name().substring(0, 15),
    '',
    'Unknown Bluetooth'
  ]);

  // Bluetooth frequency hopping
  const btFreqs = [2402000, 2426000, 2450000, 2474000, 2478000];
  const freqMap = {};
  faker.helpers.arrayElements(btFreqs, { min: 1, max: 5 }).forEach(freq => {
    freqMap[freq] = faker.number.int({ min: 1, max: Math.floor(totalPackets / 2) });
  });

  return {
    "kismet.device.base.macaddr": mac,
    "kismet.device.base.name": deviceName || "Unknown Bluetooth",
    "kismet.device.base.type": "Bluetooth",
    "kismet.device.base.basictype": "peer",
    "kismet.device.base.phyname": "Bluetooth",
    "kismet.device.base.devicetag": 0,
    "kismet.device.base.manuf": manufacturerName,
    "kismet.device.base.first_time": times.first_time,
    "kismet.device.base.last_time": times.last_time,
    "kismet.device.base.mod_time": times.mod_time,
    "kismet.device.base.packets.total": totalPackets,
    "kismet.device.base.packets.llc": 0,
    "kismet.device.base.packets.error": faker.number.int({ min: 0, max: 3 }),
    "kismet.device.base.packets.data": totalPackets,
    "kismet.device.base.datasize": dataSize,
    "kismet.device.base.signal": generateSignalData(false),
    "kismet.device.base.freq_khz_map": freqMap,
    "bluetooth.device": {
      "bluetooth.device.bd_addr": mac,
      "bluetooth.device.bd_name": deviceName,
      "bluetooth.device.class": faker.number.int({ min: 0, max: 7936 }),
      "bluetooth.device.lmp_version": faker.number.int({ min: 0, max: 10 }),
      "bluetooth.device.lmp_subversion": faker.number.int({ min: 0, max: 65535 }),
      "bluetooth.device.manufacturer": parseInt(manufacturerId),
      "bluetooth.device.scan_data": faker.helpers.maybe(() => faker.string.hexadecimal({ length: 32, prefix: '' }), { probability: 0.3 }) || ""
    }
  };
}

function generateKismetData(options = {}) {
  const {
    numAccessPoints = faker.number.int({ min: 2, max: 8 }),
    numClients = faker.number.int({ min: 3, max: 12 }),
    numBluetoothDevices = faker.number.int({ min: 1, max: 6 })
  } = options;

  const devices = [];

  // Generate access points
  for (let i = 0; i < numAccessPoints; i++) {
    devices.push(generateWiFiAccessPoint());
  }

  // Generate client devices
  for (let i = 0; i < numClients; i++) {
    devices.push(generateWiFiClient());
  }

  // Generate Bluetooth devices
  for (let i = 0; i < numBluetoothDevices; i++) {
    devices.push(generateBluetoothDevice());
  }

  // Shuffle the array to mix device types
  return faker.helpers.shuffle(devices);
}

// Export the functions for use in other modules
module.exports = {
  generateKismetData,
  generateWiFiAccessPoint,
  generateWiFiClient,
  generateBluetoothDevice
};