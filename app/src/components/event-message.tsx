export interface ShortEvent {
  active: boolean;
  acknowledged: boolean;
  message: string;
  time: string;
}
export function EventMessage({event}:{event: ShortEvent}){
  const { active, acknowledged, message, time } = event;

  return (<tr>
    <td>{active ? "Yes" : "No"}</td>
    <td>{acknowledged ? "Yes" : "No"}</td>
    <td>{message}</td>
    <td>{time}</td>
  </tr>)
}