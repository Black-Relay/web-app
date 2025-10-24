import { EventDetailsPane } from "@/components/event-details";
import { MissionClock } from "@/components/mission-clock"
import { Switch } from "@/components/ui/switch"
import { useState } from "react";
import { mockEvents } from "@/mockdata/mock-events";

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
    <EventDetailsPane event={mockEvents[0]}/>
  </div>
}