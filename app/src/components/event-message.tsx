import { type Event } from "@/providers/EventProvider";
import "../css/event-message.css";
import { Lamp, VerticalLamps } from "./ui/lamp";

function convertISODateString(isoDate:string){
  const date = new Date(isoDate);
  return date.toLocaleTimeString('en-gb');
}

export function EventMessage({event}:{event: Event}){
  const { active, acknowledged, topic, category, data, createdAt } = event;

  return (<div className="event-tile">
    <VerticalLamps>
      {/* <Lamp state={active ? "active" : ""} /> */}
      <Lamp state={acknowledged ? "ack" : "unack"} />
    </VerticalLamps>
    <div className="timestamp">{convertISODateString(createdAt)}</div>
    <div className="event-message">
      <span className={category.toLowerCase()}>{category}</span>:
      {` ${data.sensorId ?? "Unnamed Sensor"} - `}
      {`${topic.replace("_"," ")}`}
    </div>
  </div>)
}