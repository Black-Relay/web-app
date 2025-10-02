export interface ShortEvent {
  active: boolean;
  acknowledged: boolean;
  message: string;
  time: string;
}

export interface LongEvent{
  active: boolean;
  acknowledged: boolean;
  message: string;
  date: string;
  time: string;
  category: string;
  sensor: string;
  latitude: string;
  longitude: string;
}

export interface DetailedEvent{

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

export function LongEventMessage({event}:{event: LongEvent}){
  const { active, acknowledged, message, date, time, category, sensor, latitude, longitude } = event;

  return (<tr>
    <td>{active ? "Yes" : "No"}</td>
    <td>{acknowledged ? "Yes" : "No"}</td>
    <td>{date}</td>
    <td>{time}</td>
    <td>{category}</td>
    <td>{sensor}</td>
    <td>{latitude} x {longitude}</td>
    <td>{message}</td>
  </tr>)
}

export function EventDetail({event}:{event: DetailedEvent}){
  const {} = event;

  return (<>

  </>)
}