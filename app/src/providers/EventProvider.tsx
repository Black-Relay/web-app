import React, { createContext, useContext, useState } from "react";

type Event = {

}

interface EventContextType {
  events: Array<Event>;
  setEvents: React.Dispatch<React.SetStateAction<Array<Event>>>;
}

const EventContext = createContext<EventContextType|null>(null);

function useEventContext():EventContextType{
  const value:EventContextType|null = useContext(EventContext);
  if (!value) throw new Error('useEventContext hook used without EventContext');
  return value;
}

export default function EventProvider({children}:{children: React.ReactNode}){
  const [events, setEvents] = useState([{}]);
  const value = {
    events: events,
    setEvents: setEvents
  };

  return(
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

export { EventContext, useEventContext};
export type { Event, EventContextType };