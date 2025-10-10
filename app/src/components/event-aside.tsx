import { EventMessage } from "./event-message";
import { mockEvents } from "@/mockdata/mock-events";
import "../css/event-message.css";


export function EventsAside(){

  return (<div className="event-wrapper">
    {mockEvents.map((message, index)=><EventMessage key={index} event={message}/>)}
  </div>)
}