import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import "../../css/map.css";
import { useEventContext, type Event } from '@/providers/EventProvider';
import { useMemo } from 'react';

interface GroupedEvents {
  latitude: number;
  longitude: number;
  events: Event[];
}

// Priority order for event categories
const EVENT_PRIORITY: { [key: string]: number } = {
  'THREAT': 1,
  'ALARM': 2,
  'ALERT': 3,
  'DETECT': 4
};

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
    
    const latitude = (event.data?.LAT as number) || 35.7796;
    const longitude = (event.data?.LON as number) || -78.6382;
    
    // Round to 4 decimal places for reasonable grouping (~11m precision)
    const key = `${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
    
    if (groups[key]) {
      groups[key].events.push(event);
    } else {
      groups[key] = {
        latitude,
        longitude,
        events: [event]
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
  
  return (
    <Marker position={[latitude, longitude]}>
      <Popup maxWidth={280} maxHeight={180}>
        <div style={{ fontSize: '12px' }}>
          <strong>
            {eventCount > 1 ? `${eventCount} Events` : 'Event'} at this location
          </strong>
          <br />
          <small>Coords: {latitude.toFixed(4)}, {longitude.toFixed(4)}</small>
          <div style={{ maxHeight: '100px', overflowY: 'auto', marginTop: '5px' }}>
            {eventsToShow.map((event, index) => (
              <div key={`${event._id || index}`} style={{ 
                marginBottom: '4px', 
                paddingBottom: '4px', 
                borderBottom: index < eventsToShow.length - 1 ? '1px solid #ddd' : 'none' 
              }}>
                <span className={event.category?.toLowerCase()}>{event.category}</span> - {event.topic}
                <br />
                <small>{new Date(event.createdAt).toLocaleString()}</small>
              </div>
            ))}
            {hasMoreEvents && (
              <div style={{ fontStyle: 'italic', color: '#666', marginTop: '5px' }}>
                ...and {events.length - maxEventsToShow} more events
              </div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export function Map(){
  const { events } = useEventContext();
  
  // Memoize grouped events to prevent recalculation and stack overflow
  const groupedEvents = useMemo(() => {
    try {
      return groupEventsByLocation(events || []);
    } catch (error) {
      console.error('Error grouping events:', error);
      return [];
    }
  }, [events]);
  
  return(
    <MapContainer center={[35.28, -79.64]} zoom={8} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="http://localhost:8080/tile/{z}/{x}/{y}.png"
      />
      {groupedEvents.map((group, index) => (
        <CombinedPin 
          key={`${group.latitude}-${group.longitude}-${group.events.length}-${index}`} 
          groupedEvents={group} 
        />
      ))}
    </MapContainer>
  )
}