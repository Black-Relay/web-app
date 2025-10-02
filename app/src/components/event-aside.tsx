import { EventMessage } from "./event-message";
import "../css/event-aside.css";
import { mockEvents } from "@/mockdata/mock-events";


export function EventsAside(){

  return (<div className="table-wrapper">
    <table className="dashboard-event-table">
      <thead>
        <tr>
          <th>Active</th>
          <th>Ack</th>
          <th>Message</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {mockEvents.map((message, index)=><EventMessage key={index} event={message}/>)}
      </tbody>
    </table>
  </div>)
}