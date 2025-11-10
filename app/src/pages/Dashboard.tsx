import { MissionClock } from "@/components/mission-clock"
import { EventsAside } from "@/components/event-aside";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { SensorsAside } from "@/components/sensor-aside";
import { Map } from "@/components/ui/map";

export function Dashboard() {
  const [aside, setAside] = useState("Sensor");
  const [mission, setMission] = useState("Test Operation"); // convert to context

  return (<div className="layout-main-content">
    <header>
      <h1>{mission}</h1>
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
