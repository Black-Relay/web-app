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

async function eventSubscriber(
  subscription: string, 
  setLocalAlarms: React.Dispatch<React.SetStateAction<Event[]>>,
  setSubscriptionStatus: React.Dispatch<React.SetStateAction<{[key: string]: 'connected' | 'failed' | 'pending'}>>
){
  try {
    // Set status to pending
    setSubscriptionStatus(prev => ({ ...prev, [subscription]: 'pending' }));
    
    const response = await fetch(`${apiUrl}/topic/${subscription}/subscribe`, {credentials: "include"});
    console.log(response);
    
    if (response.status !== 200 && response.status !== 201) {
      // Set status to failed
      setSubscriptionStatus(prev => ({ ...prev, [subscription]: 'failed' }));
      
      // Generate alarm event for subscription failure
      const subscriptionFailureAlarm: Event = {
        _id: `subscription-failure-${subscription}-${Date.now()}`,
        category: "ALARM",
        topic: "Subscription Failure",
        data: {
          "subscription": subscription,
          "message": `Failed to subscribe to topic: ${subscription}`,
          "status": response.status,
          "statusText": response.statusText
        },
        createdAt: new Date().toISOString(),
        acknowledged: false,
        active: true,
        __v: 0
      };
      
      // Add the alarm to local alarms
      setLocalAlarms(prevAlarms => {
        const existingAlarm = prevAlarms.find(alarm => 
          alarm.topic === "Subscription Failure" && 
          alarm.data.subscription === subscription && 
          alarm.active
        );
        if (!existingAlarm) {
          return [subscriptionFailureAlarm, ...prevAlarms];
        }
        return prevAlarms;
      });
      return false;
    }
    
    // Set status to connected
    setSubscriptionStatus(prev => ({ ...prev, [subscription]: 'connected' }));
    
    // Subscription successful, set any existing subscription alarms for this topic to inactive
    setLocalAlarms(prevAlarms => 
      prevAlarms.map(alarm => {
        if ((alarm.topic === "Subscription Failure" || 
             (alarm.topic === "Network Error" && alarm.data.subscription === subscription)) && 
            alarm.active) {
          return { ...alarm, active: false };
        }
        return alarm;
      })
    );
    
    return true;
  } catch (error) {
    // Set status to failed
    setSubscriptionStatus(prev => ({ ...prev, [subscription]: 'failed' }));
    
    // Generate alarm event for network/connection failure
    const networkFailureAlarm: Event = {
      _id: `network-failure-${subscription}-${Date.now()}`,
      category: "ALARM", 
      topic: "Network Error",
      data: {
        "subscription": subscription,
        "message": `Network error while subscribing to topic: ${subscription}`,
        "error": error instanceof Error ? error.message : "Unknown error"
      },
      createdAt: new Date().toISOString(),
      acknowledged: false,
      active: true,
      __v: 0
    };
    
    // Add the alarm to local alarms
    setLocalAlarms(prevAlarms => {
      const existingAlarm = prevAlarms.find(alarm => 
        alarm.topic === "Network Error" && 
        alarm.data.subscription === subscription && 
        alarm.active
      );
      if (!existingAlarm) {
        return [networkFailureAlarm, ...prevAlarms];
      }
      return prevAlarms;
    });
    return false;
  }
}

async function eventConsumer(){
  try{
    const response = await fetch(`${apiUrl}/event`, {credentials: "include"})
    
    if (response.status !== 200 && response.status !== 201) {
      // Generate alarm event for event consumer failure
      return [{
        _id: `event-consumer-failure-${Date.now()}`,
        category: "ALARM",
        topic: "Event Consumer Failure",
        data: {
          "service": "Event Consumer",
          "message": `Failed to fetch events from server`,
          "status": response.status,
          "statusText": response.statusText
        },
        createdAt: new Date().toISOString(),
        acknowledged: false,
        active: true,
        __v: 0
      }]
    }
    
    const json = await response.json();
    return Array.isArray(json) ? json : [json];
  }
  catch(error){
    return [{
      _id: `event-consumer-error-${Date.now()}`,
      category: "ALARM",
      topic: "Network Error",
      data: {
        "service": "Event Consumer",
        "message": "Network error or invalid credentials while fetching events",
        "error": error instanceof Error ? error.message : "Unknown error"
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
  const [localAlarms, setLocalAlarms] = useState<Event[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{[key: string]: 'connected' | 'failed' | 'pending'}>({});
  const { user } = useUserContext();
  const pollingReference = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const attemptReconnection = async () => {
    const failedSubscriptions = Object.keys(subscriptionStatus).filter(
      sub => subscriptionStatus[sub] === 'failed'
    );
    
    if (failedSubscriptions.length > 0) {
      console.log('Attempting to reconnect failed subscriptions:', failedSubscriptions);
      for (const sub of failedSubscriptions) {
        await eventSubscriber(sub, setLocalAlarms, setSubscriptionStatus);
      }
    }
  };

  const consumeData = async () => {
    let serverEvents = await eventConsumer();
    
    // Filter out sensor_status events, except for alarms
    serverEvents = serverEvents.filter((event: Event) => 
      event.topic !== "sensor_status" || event.category === "ALARM"
    );
    
    // Check if eventConsumer returned an alarm (connection issue)
    const hasConsumerAlarm = serverEvents.some((event: Event) => 
      event.topic === "Event Consumer Failure" || event.topic === "Network Error"
    );
    
    if (!hasConsumerAlarm) {
      // Connection is working, set any existing consumer alarms to inactive
      setLocalAlarms(prevAlarms => 
        prevAlarms.map(alarm => {
          if ((alarm.topic === "Event Consumer Failure" || alarm.topic === "Network Error") && 
              alarm.data.service === "Event Consumer" && alarm.active) {
            return { ...alarm, active: false };
          }
          return alarm;
        })
      );
    } else {
      // Add new consumer alarm to local alarms if it doesn't already exist
      const newAlarm = serverEvents.find((event: Event) => 
        event.topic === "Event Consumer Failure" || event.topic === "Network Error"
      );
      if (newAlarm) {
        setLocalAlarms(prevAlarms => {
          const existingAlarm = prevAlarms.find(alarm => 
            alarm.topic === newAlarm.topic && 
            alarm.data.service === "Event Consumer" && 
            alarm.active
          );
          if (!existingAlarm) {
            return [newAlarm, ...prevAlarms];
          }
          return prevAlarms;
        });
      }
      // Filter out alarm from server events since we're managing it locally
      serverEvents = serverEvents.filter((event: Event) => 
        !(event.topic === "Event Consumer Failure" || 
          (event.topic === "Network Error" && event.data.service === "Event Consumer"))
      );
    }
    
    // Combine server events with local alarms
    setEvents(prevEvents => {
      const combinedEvents = [...localAlarms, ...serverEvents];
      
      // Sort by threat level first (THREAT > ALARM > ALERT > DETECT), then by recency
      const threatPriority: { [key: string]: number } = { THREAT: 1, ALARM: 2, ALERT: 3, DETECT: 4 };
      
      combinedEvents.sort((a, b) => {
        // First sort by threat level priority
        const aPriority = threatPriority[a.category] || 5;
        const bPriority = threatPriority[b.category] || 5;
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority; // Lower number = higher priority
        }
        
        // If same threat level, sort by recency (most recent first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      return combinedEvents.slice(0, 400);
    });
  }

  const value = {
    events: events
  };

  // Initial subscription attempt on user login
  useEffect(()=>{
    if( user.username == "" ) return;
    subscriptions.forEach(sub => {
      if (!subscriptionStatus[sub] || subscriptionStatus[sub] === 'failed') {
        eventSubscriber(sub, setLocalAlarms, setSubscriptionStatus);
      }
    });
  }, [user, subscriptions])

  // Periodic reconnection attempts for failed subscriptions
  useEffect(()=>{
    if( user.username == "" ) return;
    
    reconnectTimeoutRef.current = setInterval(() => {
      attemptReconnection();
    }, 30000); // Attempt reconnection every 30 seconds

    return () => {
      if (reconnectTimeoutRef.current) clearInterval(reconnectTimeoutRef.current);
    }
  }, [subscriptionStatus])

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