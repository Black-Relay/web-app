import SensorGroup from "./sensor-group";
import { useSensorContext, type Sensor } from "@/providers/SensorProvider";

function groupSensorsByTopic(sensors:Sensor[]){
  const sensorGroups: {[key:string]: Sensor[]} = {};
  sensors.filter(sensor => sensor && sensor["Sensor-type"]).forEach((sensor)=>{
    const sensorType = sensor["Sensor-type"];
    if( !Object.keys(sensorGroups).includes(sensorType) ) sensorGroups[sensorType] = [];
    sensorGroups[sensorType].push(sensor);
  })
  return sensorGroups;
}


export function SensorsAside(){
  const { sensors } = useSensorContext();
  let sensorData = sensors.map(sensor => sensor.data).filter(data => data != null)
  
  const sensorTopics = groupSensorsByTopic(sensorData);

  return (<div className="sensor-wrapper">
    {Object.keys(sensorTopics).map((group, index) => <SensorGroup key={`sensor_group-${index}`} name={group} sensors={sensorTopics[group]} />)}
  </div>)
}