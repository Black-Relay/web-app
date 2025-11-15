import SensorGroup from "./sensor-group";
import { useSensorContext, type Sensor } from "@/providers/SensorProvider";

function groupSensorsByTopic(sensors:Sensor[]){
  const sensorGroups: {[key:string]: Sensor[]} = {};
  sensors.forEach((sensor)=>{
    if( !Object.keys(sensorGroups).includes(sensor["Sensor-type"]) ) sensorGroups[sensor["Sensor-type"]] = [];
    sensorGroups[sensor["Sensor-type"]].push(sensor);
  })
  return sensorGroups;
}


export function SensorsAside(){
  const { sensors } = useSensorContext();
  let sensorData = sensors.map(sensor => sensor.data)
  
  const sensorTopics = groupSensorsByTopic(sensorData);

  return (<div className="sensor-wrapper">
    {Object.keys(sensorTopics).map((group, index) => <SensorGroup key={`sensor_group-${index}`} name={group} sensors={sensorTopics[group]} />)}
  </div>)
}