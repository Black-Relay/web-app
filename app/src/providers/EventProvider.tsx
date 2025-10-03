import React, { createContext, useContext, useEffect, useState } from "react";
import { useUserContext } from "./UserProvider";

type Event = {

}

type Subscription = {
  name: string;
  frequency: number;
}

interface EventContextType {
  events: Array<Event>;
  subscriptions: Array<Subscription>;
}

const EventContext = createContext<EventContextType|null>(null);
const baseUrl = "http://localhost";
const basePort = 3001;

function useEventContext():EventContextType{
  const value:EventContextType|null = useContext(EventContext);
  if (!value) throw new Error('useEventContext hook used without EventContext');
  return value;
}

async function eventSubscriber(subscription: string){
  const response = await fetch(`${baseUrl}:${basePort}/topic/${subscription}/subscribe`, {credentials: "include"});
  console.log(response);
  return response.status == 200 || response.status == 201 ? true : false;
}

async function eventConsumer(subscription: string){
  const response = await fetch(`${baseUrl}:${basePort}/topic/${subscription}`);
  console.log(response);
}

export default function EventProvider({children}:{children: React.ReactNode}){
  const [events, setEvents] = useState([{}]);
  const [subscriptions, setSubscriptions] = useState([{name: "gas", frequency: 15000}]);
  const { user } = useUserContext();

  const value = {
    events: events,
    subscriptions: subscriptions
  };

  useEffect(()=>{
    // if( user.username == "" ) return;
    subscriptions.forEach(
      async ({name, frequency}) => {
        let status = await eventSubscriber(name)
        if(status) setInterval(()=>{eventConsumer(name)}, frequency)
      }
    );
  },[user])

  return(
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

export { EventContext, useEventContext};
export type { Event, EventContextType };