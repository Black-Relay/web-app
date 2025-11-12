import { EventDetailsPane } from "@/components/event-details";
import { MissionClock } from "@/components/mission-clock"
import { Switch } from "@/components/ui/switch"
import { useState } from "react";
import { mockEvents } from "@/mockdata/mock-events";
import { EventTable } from "@/components/event-table";
import { useEventContext } from "@/providers/EventProvider";

export function Events(){
  const [table, setTable] = useState("All");
  const { events } = useEventContext();
  const columnNames = [
    { key: "_id", header: "ID", sortable: true },
    { key: "createdAt", header: "TIME", sortable: true },
    { key: "category", header: "TYPE", sortable: true },
    { key: "data.sensorId", header: "SENSOR", sortable: true },
    { key: "topic", header: "GROUP", sortable: true }
  ]

  return <div className="layout-main-content no-footer">
    <header>
      <div>create event</div>
      <div>pin bar</div>
    </header>
    <MissionClock />
    <main>
      <Switch labels={["All","Detects","Alerts","Threats","Alarms"]} setSwitch={setTable}/>
      <EventTable columns={columnNames} data={events} />
      <div>pagination functions</div>
    </main>
    <EventDetailsPane event={mockEvents[0]}/>
  </div>
}