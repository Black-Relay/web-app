import { useState } from "react";
import "../css/sensor-group.css";

export type Sensor = {
  "Sensor_ID": string;
  "Sensor-type": string;
  "LAT": number;
  "LON": number;
  [key:string]: number|string|boolean;
}

export default function SensorGroup({name, sensors}:{name: string, sensors:Sensor[]}){
  const [toggleOn, setToggleOn] = useState<boolean>(false)

  return (<div className="sensor-group">
    <button className={"collapsible" + (toggleOn ? " active" : "")} onClick={()=>{setToggleOn(!toggleOn)}}>{name}</button>
    <div className="content">
      {sensors.map((sensor, index) => <p key={`sensor-${name}-${index}`}>{sensor.Sensor_ID}</p>)}
    </div>
  </div>)
}