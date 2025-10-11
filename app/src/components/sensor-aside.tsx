import { mockSensors } from "@/mockdata/mock-sensors";
import SensorGroup from "./sensor-group";
import { type Sensor } from "./sensor-group";


function groupSensors(sensors:Sensor[]){
  const sensorGroups: {[key:string]: Sensor[]} = {};
  sensors.forEach((sensor)=>{
    if( !Object.keys(sensorGroups).includes(sensor.group) ) sensorGroups[sensor.group] = [];
    sensorGroups[sensor.group].push(sensor);
  })
  return sensorGroups;
}

function groupSensorsByTopic(sensors:Sensor[]){
  const sensorGroups: {[key:string]: Sensor[]} = {};
  sensors.forEach((sensor)=>{
    if( !Object.keys(sensorGroups).includes(sensor.topic) ) sensorGroups[sensor.topic] = [];
    sensorGroups[sensor.topic].push(sensor);
  })
  return sensorGroups;
}

export function SensorsAside(){
  const sensorGroups = groupSensors(mockSensors);
  const sensorTopics = groupSensorsByTopic(mockSensors);

  return (<div>
    {Object.keys(sensorTopics).map((group, index) => <SensorGroup key={`sensor_group-${index}`} name={group} sensors={sensorTopics[group]} />)}
    {Object.keys(sensorGroups).map((group, index) => <SensorGroup key={`sensor_group-${index}`} name={group} sensors={sensorGroups[group]} />)}
  </div>)
}