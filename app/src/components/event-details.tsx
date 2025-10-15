import type { Event } from "@/providers/EventProvider";
import { HorizontalLamps, LampLabel, Lamp } from "./ui/lamp";
import "../css/event-message.css";

export function EventDetailsPane({event}:{event:Event}){
  const {_id, category, topic, data, createdAt, acknowledged, active, __v} = event;

  return (<div className="main-subcontent">
    <h2>Event Details</h2>
    <div>
      <p>ID: {_id}</p>
      <p>Time: {createdAt}</p>
      <p>Type: <span className={category.toLowerCase()}>{category}</span></p>
      <p>Topic: {topic}</p>
      <p>Status: &nbsp;
        <HorizontalLamps>
          <LampLabel label="Ack'd">
            <Lamp state={acknowledged ? "ack" : "unack"} />
          </LampLabel>
          <LampLabel label="Active">
            <Lamp state={active ? "active" : ""} />
          </LampLabel>
        </HorizontalLamps>
      </p>
    </div>
    <div>Notes Section</div>
    <div>UI Components</div>
  </div>)
}