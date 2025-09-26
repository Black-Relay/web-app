import { useEffect, useState } from "react"

export function MissionClock(){
  const [date, setDate] = useState("DD-MMM-YYY");
  const [time, setTime] = useState("00:00:00");

  useEffect(()=>{
    setInterval(()=>{
      const currentDate = new Date();
      setDate(currentDate.toLocaleDateString('en-us', {day: 'numeric', month: 'short', year: 'numeric'}))
      setTime(currentDate.toLocaleTimeString('en-gb'));
    }, 1000)
  }, [])

  return (<div className="mission-clock">
    <div className="date-time-wrapper">
      <p>{date}</p>
      <p>{time}</p>
    </div>
  </div>)
}