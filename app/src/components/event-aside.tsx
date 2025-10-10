import { EventMessage } from "./event-message";
import { mockEvents } from "@/mockdata/mock-events";


export function EventsAside(){

  return (<div className="table-wrapper">
    {mockEvents.map((message, index)=><EventMessage key={index} event={message}/>)}
  </div>)
}