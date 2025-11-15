import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../css/map.css";
import { useEventContext, type Event } from "@/providers/EventProvider";
import { useMemo } from "react";
import config from "../../configs/config.json";
import L from "leaflet";

const { osmUrl } = {
  osmUrl: import.meta.env.VITE_OSM_URL || config.osmUrl,
};

interface GroupedEvents {
  latitude: number;
  longitude: number;
  events: Event[];
}

// Priority order for event categories
const EVENT_PRIORITY: { [key: string]: number } = {
  THREAT: 1,
  ALARM: 2,
  ALERT: 3,
  DETECT: 4,
};

// Get priority color for display
function getPriorityColor(category: string): string {
  switch (category.toUpperCase()) {
    case "THREAT":
      return "#fe9a00"; // Orange
    case "ALARM":
      return "#fe0000"; // Red
    case "ALERT":
      return "#fefa00"; // Yellow
    case "DETECT":
      return "#009dfe"; // Blue
    default:
      return "#666666"; // Gray
  }
}

// Get CSS class for threat level color
function getThreatLevelClass(category: string): string {
  switch (category.toUpperCase()) {
    case "THREAT":
      return "teardrop-threat";
    case "ALARM":
      return "teardrop-alarm";
    case "ALERT":
      return "teardrop-alert";
    case "DETECT":
      return "teardrop-detect";
    default:
      return "teardrop-default";
  }
}

// Create teardrop-shaped pin with threat level color and dark border
function createTearDropPin(category: string): L.DivIcon {
  const colorClass = getThreatLevelClass(category);

  return L.divIcon({
    html: `
      <div class="teardrop-container">
        <div class="teardrop-outer"></div>
        <div class="teardrop-inner ${colorClass}"></div>
        <div class="teardrop-center"></div>
      </div>
    `,
    className: "teardrop-marker",
    iconSize: [30, 40],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
}

// Get custom teardrop icon based on highest priority event
function getTearDropIcon(events: Event[]): L.DivIcon {
  if (!events || events.length === 0) return createTearDropPin("");

  const highestPriorityEvent = events[0]; // Already sorted by priority
  return createTearDropPin(highestPriorityEvent.category || "");
}

// Sort events by priority (THREAT > ALARM > ALERT > DETECT)
function sortEventsByPriority(events: Event[]): Event[] {
  return events.sort((a, b) => {
    const priorityA = EVENT_PRIORITY[a.category?.toUpperCase()] || 999;
    const priorityB = EVENT_PRIORITY[b.category?.toUpperCase()] || 999;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // If same priority, sort by newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

// Optimized grouping function to prevent call stack overflow
function groupEventsByLocation(events: Event[]): GroupedEvents[] {
  if (!events || events.length === 0) return [];

  const groups: { [key: string]: GroupedEvents } = {};

  // Use for loop instead of forEach to avoid potential stack issues
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    if (!event) continue;

    const latitude = (event.data?.LAT as number) || 35.16863;
    const longitude = (event.data?.LON as number) || -79.398915;

    // Round to 4 decimal places for reasonable grouping (~11m precision)
    const key = `${latitude.toFixed(4)}_${longitude.toFixed(4)}`;

    if (groups[key]) {
      groups[key].events.push(event);
    } else {
      groups[key] = {
        latitude,
        longitude,
        events: [event],
      };
    }
  }

  // Sort events within each group by priority
  const groupedArray = Object.values(groups);
  for (let i = 0; i < groupedArray.length; i++) {
    groupedArray[i].events = sortEventsByPriority(groupedArray[i].events);
  }

  return groupedArray;
}

function CombinedPin({ groupedEvents }: { groupedEvents: GroupedEvents }) {
  const { latitude, longitude, events } = groupedEvents;
  const eventCount = events.length;

  // Events are already sorted by priority in groupEventsByLocation
  // Limit events shown to prevent DOM overflow
  const maxEventsToShow = 20;
  const eventsToShow = events.slice(0, maxEventsToShow);
  const hasMoreEvents = events.length > maxEventsToShow;

  // Get the highest priority category for display
  const highestPriorityEvent = events[0];
  const priorityIndicator = highestPriorityEvent?.category?.toUpperCase();

  // Get custom teardrop icon with threat level color
  const tearDropIcon = getTearDropIcon(events);

  return (
    <Marker position={[latitude, longitude]} icon={tearDropIcon}>
      <Popup maxWidth={280} maxHeight={180}>
        <div className="popup-content">
          <div className="popup-header">
            {eventCount > 1 ? `${eventCount} Events` : "Event"} at this location
          </div>
          {priorityIndicator && (
            <span
              className="popup-priority-badge"
              style={{ backgroundColor: getPriorityColor(priorityIndicator) }}
            >
              {priorityIndicator}
            </span>
          )}
          <br />
          <div className="popup-coords">
            Coords: {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </div>
          <div className="popup-events-container">
            {eventsToShow.map((event, index) => (
              <div
                key={`${event._id || index}`}
                className={`popup-event-item ${index < eventsToShow.length - 1 ? "popup-event-separator" : ""}`}
              >
                <span className={event.category?.toLowerCase()}>
                  {event.category}
                </span>{" "}
                - {event.topic}
                <br />
                <small>{new Date(event.createdAt).toLocaleString()}</small>
              </div>
            ))}
            {hasMoreEvents && (
              <div className="popup-more-events">
                ...and {events.length - maxEventsToShow} more events
              </div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export function Map() {
  const { events } = useEventContext();

  // Memoize grouped events to prevent recalculation and stack overflow
  const groupedEvents = useMemo(() => {
    try {
      // Filter out inactive events before grouping
      const activeEvents = (events || []).filter(event => event.active !== false);
      return groupEventsByLocation(activeEvents);
    } catch (error) {
      console.error("Error grouping events:", error);
      return [];
    }
  }, [events]);

  return (
    <MapContainer center={[35.28, -79.64]} zoom={8} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={`${osmUrl}/tile/{z}/{x}/{y}.png`}
      />
      {groupedEvents.map((group, index) => (
        <CombinedPin
          key={`${group.latitude}-${group.longitude}-${group.events.length}-${index}`}
          groupedEvents={group}
        />
      ))}
    </MapContainer>
  );
}
