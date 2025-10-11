import { useState } from "react";
import "../css/sensor-group.css";

export type Sensor = {
  sensorName: string;
  sensorId: string;
  topic: string;
  group: string;
}

export default function SensorGroup({name, sensors}:{name: string, sensors:Sensor[]}){
  const [toggleOn, setToggleOn] = useState<boolean>(false)

  return (<div className="sensor-group">
    <button className={"collapsible" + (toggleOn ? " active" : "")} onClick={()=>{setToggleOn(!toggleOn)}}>{name}</button>
    <div className="content">
      {sensors.map((sensor, index) => <p key={`sensor-${name}-${index}`}>{sensor.sensorName}</p>)}
    </div>
  </div>)
}