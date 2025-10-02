import { useEffect, useState } from "react"

export function MissionClock({zone = NaN, title}:{zone?: number, title?: string}){
  const [date, setDate] = useState("DD-MMM-YYY");
  const [time, setTime] = useState("00:00:00");

  useEffect(()=>{
    setInterval(()=>{
      let currentDate = new Date();
      if( !isNaN(zone) ) {
        let offset = zone * 3600000 + currentDate.getTimezoneOffset() * 60000;
        currentDate.setTime(currentDate.getTime() + offset);
      }
      setDate(currentDate.toLocaleDateString('en-us', {day: 'numeric', month: 'short', year: 'numeric'}))
      setTime(currentDate.toLocaleTimeString('en-gb'));
    }, 1000)
  }, [])

  return (<div className="mission-clock">
    <div className="date-time-wrapper">
      {title ? <p className="header">{title}</p>:<p className="header">{date}</p>}
      <p className="time">{time}</p>
    </div>
  </div>)
}