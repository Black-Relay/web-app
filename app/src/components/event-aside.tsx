import { EventMessage, type ShortEvent } from "./event-message";

let mockEvents:Array<ShortEvent> = [
  {
    active: false,
    acknowledged: false,
    message: "DETECT: AMCIT by SENSOR -- 35°1'N x 45°38'E | DISTANCE: 450ft",
    time: "18:43:52"
  },
  {
    active: true,
    acknowledged: false,
    message: "DETECT: AMCIT by SENSOR -- 35°1'N x 45°38'E | DISTANCE: 450ft",
    time: "18:43:52"
  },
  {
    active: false,
    acknowledged: true,
    message: "DETECT: AMCIT by SENSOR -- 35°1'N x 45°38'E | DISTANCE: 450ft",
    time: "18:43:52"
  },
  {
    active: true,
    acknowledged: true,
    message: "DETECT: AMCIT by SENSOR -- 35°1'N x 45°38'E | DISTANCE: 450ft",
    time: "18:43:52"
  },
]

export function EventsAside(){

  return (<>
    <table>
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
  </>)
}