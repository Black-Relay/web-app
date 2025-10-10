type sensor = {
  sensorName: string;
  sensorId: string;
  topic: string;
  group: string;
}

export const sensors: sensor[] = [
  {
    sensorName: "A_Park",
    sensorId: "123",
    topic: "camera",
    group: "victory_st"
  },
  {
    sensorName: "Cam_1",
    sensorId: "123",
    topic: "camera",
    group: "west"
  },
  {
    sensorName: "South Cam",
    sensorId: "123",
    topic: "camera",
    group: "south"
  },
  {
    sensorName: "train_cam_1",
    sensorId: "123",
    topic: "audio",
    group: "train_station"
  },
  {
    sensorName: "Mic_1",
    sensorId: "123",
    topic: "audio",
    group: "train_station"
  },
  {
    sensorName: "train_1",
    sensorId: "123",
    topic: "audio",
    group: "train_station"
  },
  {
    sensorName: "train_2",
    sensorId: "123",
    topic: "gas",
    group: "train_station"
  },
  {
    sensorName: "train_gas_1",
    sensorId: "123",
    topic: "gas",
    group: "train_station"
  },
  {
    sensorName: "train_gas_2",
    sensorId: "123",
    topic: "gas",
    group: "train_station"
  },
]