import { type Event } from "@/providers/EventProvider";
import "../css/event-message.css";

export function EventMessage({event}:{event: Event}){
  const { active, acknowledged, category, data, createdAt } = event;

  return (<div className="event-tile">
    <div className="event-lamps">
      <div className={"lamp" + (active ? " active" : "")}></div>
      <div className={"lamp" + (acknowledged ? " ack" : " unack")}></div>
    </div>
    <div className="timestamp">{createdAt}</div>
    <div className="event-message">
      {`[Sensor Name] - `}
      <span className={category.toLowerCase()}>{category}</span>
      {`\n[Some message]`}
    </div>
  </div>)


  // <tr>
  //   <td>{active ? "Yes" : "No"}</td>
  //   <td>{acknowledged ? "Yes" : "No"}</td>
  //   <td>{`[Sensor Name] - ${category}\n[Some message]`}</td>
  //   <td>{createdAt}</td>
  // </tr>

}

// export function LongEventMessage({event}:{event: Event}){
//   const { active, acknowledged, data, category } = event;

//   return (<tr>
//     <td>{active ? "Yes" : "No"}</td>
//     <td>{acknowledged ? "Yes" : "No"}</td>
//     <td>{}</td>
//     <td>{}</td>
//     <td>{category}</td>
//     <td>{""}</td>
//     <td>{"Lat"} x {"Long"}</td>
//     <td>{"Some message"}</td>
//   </tr>)
// }

// export function EventDetails({event}:{event: Event}){
//   const {} = event;

//   return (<>

//   </>)
// }