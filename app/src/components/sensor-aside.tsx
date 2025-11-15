import SensorGroup from "./sensor-group";
import { type Sensor } from "./sensor-group";
import { useSensorContext } from "@/providers/SensorProvider";
import config from "../configs/config.json";


// function groupSensors(sensors:Sensor[]){
//   const sensorGroups: {[key:string]: Sensor[]} = {};
//   sensors.forEach((sensor)=>{
//     if( !Object.keys(sensorGroups).includes(sensor.group) ) sensorGroups[sensor.group] = [];
//     sensorGroups[sensor.group].push(sensor);
//   })
//   return sensorGroups;
// }

function groupSensorsByTopic(sensors:Sensor[]){
  const sensorGroups: {[key:string]: Sensor[]} = {};
  sensors.forEach((sensor)=>{
    if( !Object.keys(sensorGroups).includes(sensor["Sensor-type"]) ) sensorGroups[sensor["Sensor-type"]] = [];
    sensorGroups[sensor["Sensor-type"]].push(sensor);
  })
  return sensorGroups;
}

// Convert SensorStatus to Sensor format for the sensor group component
function convertSensorStatusToSensor(sensorStatus: any): Sensor | null {
  const sensorId = sensorStatus.data?.sensorId || sensorStatus.data?.sensor_id;
  
  // Only process actual sensor status events with sensorId
  if (!sensorId || sensorStatus.topic !== 'sensor_status') {
    return null;
  }
  
  return {
    "Sensor_ID": sensorId,
    "Sensor-type": sensorStatus.data?.sensorType || sensorStatus.data?.sensor_type || sensorStatus.data?.["Sensor_type"] || "Unknown",
    "LAT": sensorStatus.data?.lat || sensorStatus.data?.latitude || 0,
    "LON": sensorStatus.data?.lon || sensorStatus.data?.longitude || sensorStatus.data?.lng || 0,
    ...sensorStatus.data // Include any additional sensor data
  };
}

export function SensorsAside(){
  const { sensors } = useSensorContext();
  
  // Convert sensor status events to sensor format and filter out non-sensors
  const convertedSensors = sensors
    .map(convertSensorStatusToSensor)
    .filter((sensor): sensor is Sensor => sensor !== null);
  
  // Remove duplicates by sensor ID (keep most recent)
  const uniqueSensors = convertedSensors.reduce((acc, sensor) => {
    const existing = acc.find(s => s.Sensor_ID === sensor.Sensor_ID);
    if (!existing) {
      acc.push(sensor);
    }
    return acc;
  }, [] as Sensor[]);
  
  // Ensure all configured sensors are included, even if no recent status
  const configuredSensorIds = new Set(uniqueSensors.map(s => s.Sensor_ID));
  const missingSensors = config.sensors
    .filter(sensorId => !configuredSensorIds.has(sensorId))
    .map(sensorId => ({
      "Sensor_ID": sensorId,
      "Sensor-type": "Unknown", // Default type for sensors without recent status
      "LAT": 0,
      "LON": 0,
      status: "No recent data" // Indicate this sensor hasn't reported recently
    } as Sensor));
  
  // Combine active sensors with missing configured sensors
  const allSensors = [...uniqueSensors, ...missingSensors];
  
  const sensorTopics = groupSensorsByTopic(allSensors);

  return (<div className="sensor-wrapper">
    {Object.keys(sensorTopics).map((group, index) => <SensorGroup key={`sensor_group-${index}`} name={group} sensors={sensorTopics[group]} />)}
  </div>)
}