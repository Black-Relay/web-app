import { type Event } from "@/providers/EventProvider";
import "../css/event-message.css";

export function EventMessage({event}:{event: Event}){
  const { active, acknowledged, category, data, createdAt } = event;

  return (<div className="event-tile">
    <div className="event-lamps">
      <div className={"lamp" + (active ? " active" : "")}></div>
      <div className={"lamp" + (acknowledged ? " ack" : " unack")}></div>
    </div>
    <div className="timestamp">{createdAt}</div>
    <div className="event-message">
      {`[Sensor Name] - `}
      <span className={category.toLowerCase()}>{category}</span>
      {`\n[Some message]`}
    </div>
  </div>)
}