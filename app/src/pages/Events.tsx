import { MissionClock } from "@/components/mission-clock"
import { Switch } from "@/components/ui/switch"
import { useState } from "react";

export function Events(){
  const [table, setTable] = useState("All");

  return <div className="layout-main-content no-footer">
    <header>
      <div>create event</div>
      <div>pin bar</div>
    </header>
    <MissionClock />
    <main>
      <Switch labels={["All","Detects","Alerts","Threats","Alarms"]} setSwitch={setTable}/>
      <div>Main sortable table</div>
      <div>pagination functions</div>
    </main>
    <aside>
      <div>Details Header</div>
      <div>Meta Data</div>
      <div>Notes Section</div>
      <div>UI Components</div>
    </aside>
  </div>
}