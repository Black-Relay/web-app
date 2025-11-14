import { type Event } from "@/providers/EventProvider";
import "../css/event-message.css";
import { Lamp, VerticalLamps } from "./ui/lamp";
import { useState } from "react";
import config from "../configs/config.json";
const {apiUrl} = {apiUrl: import.meta.env.VITE_API_URL || config.apiUrl}

function formatEventTimestamp(isoDate: string): string {
  const eventDate = new Date(isoDate);
  const now = new Date();
  const diffInMs = now.getTime() - eventDate.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  
  // If less than 24 hours, show time
  if (diffInHours < 24) {
    return eventDate.toLocaleTimeString('en-gb');
  }
  
  // If more than 24 hours, show relative days
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInDays === 1) {
    return "1 day ago";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return years === 1 ? "1 year ago" : `${years} years ago`;
  }
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
    <div className="timestamp">{formatEventTimestamp(createdAt)}</div>
    <div className="event-message">
      <span className={category.toLowerCase()}>{category}</span>:
      {` ${data.sensorId ?? "Unnamed Sensor"} - `}
      {`${topic.replace("_"," ")}`}
    </div>
  </div>)
}