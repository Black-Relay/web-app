import { MissionClock } from "@/components/mission-clock"
import { EventsAside } from "@/components/event-aside";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { SensorsAside } from "@/components/sensor-aside";
import { Map } from "@/components/ui/map";
import { useEventContext } from "@/providers/EventProvider";

export function Dashboard() {
  const [aside, setAside] = useState("Sensor");
  const [mission, setMission] = useState("Test Operation"); // convert to context
  const { events } = useEventContext();

  // Calculate event counts
  const threatCount = events.filter(event => event.category === "THREAT").length;
  const alarmCount = events.filter(event => event.category === "ALARM").length;
  const alertCount = events.filter(event => event.category === "ALERT").length;
  const unacknowledgedCount = events.filter(event => !event.acknowledged).length;

  return (<div className="layout-main-content">
    <header>
      <div className="header-content">
        <h1>{mission}</h1>
        <div className="event-counts">
          <div className="count-item threat">
            <span className="count-label">Threats:</span>
            <span className="count-value">{threatCount}</span>
          </div>
          <div className="count-item alarm">
            <span className="count-label">Alarms:</span>
            <span className="count-value">{alarmCount}</span>
          </div>
          <div className="count-item alert">
            <span className="count-label">Alerts:</span>
            <span className="count-value">{alertCount}</span>
          </div>
          <div className="count-item unack">
            <span className="count-label">Unacknowledged:</span>
            <span className="count-value">{unacknowledgedCount}</span>
          </div>
        </div>
      </div>
    </header>
    <main>
      <Map />
    </main>
    <MissionClock/>
    <aside>
      <Switch labels={["Sensor","Events"]} setSwitch={setAside}/>
      {aside == "Sensor" ?
        <SensorsAside></SensorsAside> :
        <EventsAside />
      }
    </aside>
    <footer>
      <MissionClock zone={+9} title="Pacific"/>
      <MissionClock zone={+2} title="Germany"/>
      <MissionClock zone={-4} title="Eastern"/>
      <MissionClock zone={-6} title="Mountain"/>
    </footer>
  </div>)
}
