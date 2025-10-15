import "../../css/lamp.css";
export function Lamp({state = ""}:{state?: ""|"active"|"unack"|"ack"}){
  return <div className={`lamp ${state}`}></div>
}