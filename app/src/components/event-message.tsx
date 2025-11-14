import { type Event } from "@/providers/EventProvider";
import "../css/event-message.css";
import { Lamp, VerticalLamps } from "./ui/lamp";
import { useState } from "react";
import config from "../configs/config.json";
const {apiUrl} = {apiUrl: import.meta.env.VITE_API_URL || config.apiUrl}

function convertISODateString(isoDate:string){
  const date = new Date(isoDate);
  return date.toLocaleTimeString('en-gb');
}

export function EventMessage({event}:{event: Event}){
  const {_id, active, acknowledged, topic, category, data, createdAt } = event;
  const [isAck, setIsAck] = useState(acknowledged);

  const handleAcknowledge = async () => {
    if (!isAck) {
      try {
        const res = await fetch(`${apiUrl}/event/id/${_id}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ acknowledged: true })
        });
        if (res.ok) setIsAck(true);
      } catch (err) {
        alert(`Unable to acknowledge ${_id}`)
      }
    }
  };

  return (<div className="event-tile">
    <VerticalLamps>
      {/* <Lamp state={active ? "active" : ""} /> */}
      <button
        aria-label={isAck ? "Acknowledged" : "Acknowledge event"}
        onClick={handleAcknowledge}
        disabled={isAck}
        style={{ background: "none", border: "none", padding: 0, cursor: isAck ? "default" : "pointer" }}
      >
        <Lamp state={isAck ? "ack" : "unack"} />
      </button>
    </VerticalLamps>
    <div className="timestamp">{convertISODateString(createdAt)}</div>
    <div className="event-message">
      <span className={category.toLowerCase()}>{category}</span>:
      {` ${data.sensorId ?? "Unnamed Sensor"} - `}
      {`${topic.replace("_"," ")}`}
    </div>
  </div>)
}