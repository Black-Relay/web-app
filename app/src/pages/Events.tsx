import { EventDetailsPane } from "@/components/event-details";
import { MissionClock } from "@/components/mission-clock"
import { Switch } from "@/components/ui/switch"
import { useState } from "react";
import { EventTable } from "@/components/event-table";
import { useEventContext } from "@/providers/EventProvider";

export function Events(){
  const [table, setTable] = useState<string>("");
  const { events } = useEventContext();
  const [ selectedEvent, setSelectedEvent ] = useState<any>(events[0]);
  const columnNames = [
    { key: "_id", header: "ID", sortable: true },
    { key: "acknowledged", header: "ACKNOWLEDGED", sortable: true},
    { key: "createdAt", header: "TIME", sortable: true },
    { key: "category", header: "TYPE", sortable: true },
    { key: "data.sensorId", header: "SENSOR", sortable: true },
    { key: "topic", header: "GROUP", sortable: true }
  ]

  function getCategoryFromSwitch(switchLabel: string): string | undefined {
    switch (switchLabel.toUpperCase()) {
      case "DETECTS": return "DETECT";
      case "ALERTS": return "ALERT";
      case "THREATS": return "THREAT";
      case "ALARMS": return "ALARM";
      default: return "";
    }
  }

  const filteredEvents = getCategoryFromSwitch(table) === "" ? events
      : events.filter(ev => (ev.category || "") === getCategoryFromSwitch(table));

  return <div className="layout-main-content no-footer">
    <header>
      <h1>Events</h1>
    </header>
    <MissionClock />
    <main>
      <Switch labels={["All","Detects","Alerts","Threats","Alarms"]} setSwitch={setTable}/>
      <EventTable columns={columnNames} data={filteredEvents} setEvent={setSelectedEvent} />
    </main>
    <EventDetailsPane event={selectedEvent}/>
  </div>
}