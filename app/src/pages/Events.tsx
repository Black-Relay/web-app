import { EventDetailsPane } from "@/components/event-details";
import { MissionClock } from "@/components/mission-clock"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react";
import { EventTable } from "@/components/event-table";
import { useEventContext } from "@/providers/EventProvider";

export function Events(){
  const [table, setTable] = useState<string>("");
  const { events } = useEventContext();
  const [ selectedEvent, setSelectedEvent ] = useState<any>(events.length > 0 ? events[0] : null);
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

  // Update selectedEvent when events become available, but preserve selection if possible
  useEffect(() => {
    if (events.length === 0) {
      // No events available, clear selection
      setSelectedEvent(null);
    } else if (!selectedEvent) {
      // No event currently selected, select the first one
      setSelectedEvent(events[0]);
    } else {
      // Try to find the currently selected event in the updated events array
      const updatedSelectedEvent = events.find(event => event._id === selectedEvent._id);
      if (updatedSelectedEvent) {
        // Update with the latest data for the same event
        setSelectedEvent(updatedSelectedEvent);
      } else {
        // Selected event no longer exists, fall back to first event
        setSelectedEvent(events[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  return <div className="layout-main-content no-footer">
    <header>
      <h1>Events</h1>
    </header>
    <MissionClock />
    <main>
      <Switch labels={["All","Detects","Alerts","Threats","Alarms"]} setSwitch={setTable}/>
      <EventTable columns={columnNames} data={filteredEvents} setEvent={setSelectedEvent} />
    </main>
    {selectedEvent ? (
      <EventDetailsPane event={selectedEvent}/>
    ) : (
      <div className="main-subcontent event-detail-wrapper">
        <h2>Event Details</h2>
        <p>No event selected</p>
      </div>
    )}
  </div>
}