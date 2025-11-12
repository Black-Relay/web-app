import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useUserContext } from "./UserProvider";
import config from "../configs/config.json";
const { apiUrl, pollingIntervalMs, subscriptions } = {
  apiUrl: import.meta.env.VITE_API_URL || config.apiUrl,
  pollingIntervalMs: Number(import.meta.env.VITE_POLLING_INTERVAL_MS) || config.pollingIntervalMs,
  subscriptions: config.subscriptions
};

type Event = {
  _id: string
  category: "DETECT" | "ALERT" | "ALARM" | "THREAT"
  topic: string;
  data: {
    [key:string]: string|number|boolean
  }
  createdAt: string;
  acknowledged: boolean;
  active?: boolean;
  __v: number;
}

interface EventContextType {
  events: Event[];
}

const EventContext = createContext<EventContextType|null>(null);

function useEventContext():EventContextType{
  const value:EventContextType|null = useContext(EventContext);
  if (!value) throw new Error('useEventContext hook used without EventContext');
  return value;
}

async function eventSubscriber(subscription: string){
  const response = await fetch(`${apiUrl}/topic/${subscription}/subscribe`, {credentials: "include"});
  console.log(response);
  return response.status == 200 || response.status == 201 ? true : false;
}

async function eventConsumer(){
  try{
    const response = await fetch(`${apiUrl}/event`, {credentials: "include"})
    const json = await response.json();
    return Array.isArray(json) ? json : [json];
  }
  catch{
    return [{
      _id: "0",
      category: "ALARM",
      topic: "Server Connection",
      data: {
        "sensorId": "Client",
        "message": "client server connection lost or invalid credentials"
      },
      createdAt: new Date().toISOString(),
      acknowledged: false,
      active: true,
      __v: 0
    }]
  }
}

export default function EventProvider({children}:{children: React.ReactNode}){
  const [events, setEvents] = useState<Event[]>([]);
  const { user } = useUserContext();
  const pollingReference = useRef<NodeJS.Timeout | null>(null);

  const consumeData = async () => {
    let eventData = await eventConsumer();
    setEvents(eventData.reverse().slice(0,100));
  }

  const value = {
    events: events
  };

  useEffect(()=>{
    if( user.username == "" ) return;
    subscriptions.forEach(sub => eventSubscriber(sub));
  }, [user, subscriptions])

  useEffect(()=>{
    if( user.username == "" ) return;
    consumeData();
    pollingReference.current = setInterval(consumeData,pollingIntervalMs);

    return () => {
      if (pollingReference.current) clearInterval(pollingReference.current);
    }
  },[user])

  return(
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

export { EventContext, useEventContext};
export type { Event, EventContextType };