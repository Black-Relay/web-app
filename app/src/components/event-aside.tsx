import { EventMessage } from "./event-message";
import "../css/event-message.css";
import { useEventContext } from "@/providers/EventProvider";


export function EventsAside(){
  const { events } = useEventContext();

  return (<div className="event-wrapper">
    {events.length === 0 ? (
      <div className="no-events-message">
        <p>No current events</p>
      </div>
    ) : (
      events.slice(0,100).map((message, index)=><EventMessage key={index} event={message}/>)
    )}
  </div>)
}