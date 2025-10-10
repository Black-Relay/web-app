import { EventMessage } from "./event-message";
import "../css/event-aside.css";
import { mockEvents } from "@/mockdata/mock-events";


export function EventsAside(){

  return (<div className="table-wrapper">
    {mockEvents.map((message, index)=><EventMessage key={index} event={message}/>)}
  </div>)
}