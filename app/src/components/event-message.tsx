import { type Event } from "@/providers/EventProvider";
import "../css/event-message.css";
import { Lamp } from "./ui/lamp";

function convertISODateString(isoDate:string){
  const date = new Date(isoDate);
  return date.toLocaleTimeString('en-gb');
}

export function EventMessage({event}:{event: Event}){
  const { active, acknowledged, category, data, createdAt } = event;

  return (<div className="event-tile">
    <div className="event-lamps">
      <Lamp state={active ? "active" : ""} />
      <Lamp state={acknowledged ? "ack" : "unack"} />
    </div>
    <div className="timestamp">{convertISODateString(createdAt)}</div>
    <div className="event-message">
      {`[Sensor Name] - `}
      <span className={category.toLowerCase()}>{category}</span>
      {`\n[Some message]`}
    </div>
  </div>)
}