import { useEffect, useState } from "react"

export function MissionClock({zone = 0, title}:{zone?: number, title?: string}){
  const [date, setDate] = useState("DD-MMM-YYY");
  const [time, setTime] = useState("00:00:00");

  useEffect(()=>{
    setInterval(()=>{
      const currentDate = new Date();
      currentDate.setTime(currentDate.getTime() + zone * 3600000);
      setDate(currentDate.toLocaleDateString('en-us', {day: 'numeric', month: 'short', year: 'numeric'}))
      setTime(currentDate.toLocaleTimeString('en-gb'));
    }, 1000)
  }, [])

  return (<div className="mission-clock">
    <div className="date-time-wrapper">
      {title ? <p>{title}</p>:<p>{date}</p>}
      <p>{time}</p>
    </div>
  </div>)
}