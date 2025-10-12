import { EventMessage } from "./event-message";
import "../css/event-message.css";
import { useEventContext } from "@/providers/EventProvider";


export function EventsAside(){
  const { events } = useEventContext();

  return (<div className="event-wrapper">
    {events.map((message, index)=><EventMessage key={index} event={message}/>)}
  </div>)
}