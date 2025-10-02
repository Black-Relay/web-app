import { MissionClock } from "@/components/mission-clock"
import { EventsAside } from "@/components/event-aside";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export function Dashboard() {
  const [aside, setAside] = useState("Sensor");

  return (<div className="layout-main-content">
    <header>
      <h1>Welcome to the dashboard</h1>
    </header>
    <main>
      <div>Page Specific Main Content i.e. maps/tables</div>
    </main>
    <MissionClock/>
    <aside>
      <Switch labels={["Sensor","Events"]} cb={setAside}/>
      {aside == "Sensor" ?
        <></> :
        <EventsAside />
      }
    </aside>
    <footer>
      <div>Page Specific Footer data</div>
    </footer>
  </div>)
}
