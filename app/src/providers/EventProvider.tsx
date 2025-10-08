import React, { createContext, useContext, useEffect, useState } from "react";
import { useUserContext } from "./UserProvider";
import subs from '../configs/subscriptions.json';

type Event = {

}

type Subscription = {
  name: string;
  frequency: number;
}

interface EventContextType {
  events: {[key: string]:Array<Event>};
  subscriptions: Array<Subscription>;
  setSubscriptions: React.Dispatch<React.SetStateAction<Array<Subscription>>>;
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
  const response = await fetch(`${baseUrl}:${basePort}/topic/${subscription}`, {credentials: "include"});
  const json = await response.json();
  return json;
}

export default function EventProvider({children}:{children: React.ReactNode}){
  const [events, setEvents] = useState<{[key: string]: Array<Event>}>({});
  const [subscriptions, setSubscriptions] = useState<Array<Subscription>>(subs);
  const { user } = useUserContext();

  const intervalIDs: NodeJS.Timeout[] = [];

  const value = {
    events: events,
    subscriptions: subscriptions,
    setSubscriptions: setSubscriptions
  };

  useEffect(()=>{
    intervalIDs.forEach(id => { clearInterval(id) })
    intervalIDs.length = 0;

    if( user.username == "" ) return;
    subscriptions.forEach(
      async ({name, frequency}) => {
        let status = await eventSubscriber(name)
        if(status) {
          const consumeData = async () => {
            let eventData = await eventConsumer(name)
            setEvents(current => Object.assign(current,{[name]: [...eventData]}))
          }
          consumeData();
          const id = setInterval(consumeData, frequency)
          intervalIDs.push(id);
        }
      }
    );
  },[user, subscriptions])

  return(
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

export { EventContext, useEventContext};
export type { Event, EventContextType };