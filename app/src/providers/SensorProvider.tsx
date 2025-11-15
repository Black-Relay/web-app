import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useUserContext } from "./UserProvider";
import { useToast } from './ToastProvider';
import config from "../configs/config.json";
import type { Event } from "./EventProvider";
const { apiUrl, pollingIntervalMs, configSensors } = {
  apiUrl: import.meta.env.VITE_API_URL || config.apiUrl,
  pollingIntervalMs: Number(import.meta.env.VITE_POLLING_INTERVAL_MS) || config.pollingIntervalMs,
  configSensors: config.sensors
};

export type Sensor = {
  "Sensor_ID": string;
  "Sensor-type": string;
  "LAT": number;
  "LON": number;
  [key:string]: number|string|boolean;
}

export type SensorStatus = {
  _id: string
  category: "DETECT" | "ALERT" | "ALARM" | "THREAT"
  topic: string;
  data: Sensor
  createdAt: string;
  acknowledged: boolean;
  active?: boolean;
  __v: number;
}

export interface SensorContextType {
  sensors: SensorStatus[];
}

const SensorContext = createContext<SensorContextType|null>(null);

export function useSensorContext():SensorContextType{
  const value:SensorContextType|null = useContext(SensorContext);
  if (!value) throw new Error('useSensorContext hook used without SensorContext');
  return value;
}

async function sensorSubscriber(
  setAlarms: React.Dispatch<React.SetStateAction<Event[]>>,
  setSubscriptionStatus: React.Dispatch<React.SetStateAction<{[key: string]: 'connected' | 'failed' | 'pending'}>>
){
  const subscription = "sensor_status";
  try {
    // Set status to pending
    setSubscriptionStatus(prev => ({ ...prev, [subscription]: 'pending' }));
    
    const response = await fetch(`${apiUrl}/topic/${subscription}/subscribe`, {credentials: "include"});
    
    if (response.status !== 200 && response.status !== 201) {
      // Set status to failed
      setSubscriptionStatus(prev => ({ ...prev, [subscription]: 'failed' }));
      
      // Generate alarm event for subscription failure
      const subscriptionFailureAlarm: Event = {
        _id: `sensor-subscription-failure-${Date.now()}`,
        category: "ALARM",
        topic: "Sensor Subscription Failure",
        data: {
          "subscription": subscription,
          "message": `Failed to subscribe to sensor status topic`,
          "status": response.status,
          "statusText": response.statusText
        },
        createdAt: new Date().toISOString(),
        acknowledged: false,
        active: true,
        __v: 0
      };
      
      // Add the alarm to alarms
      setAlarms(prevAlarms => {
        const existingAlarm = prevAlarms.find(alarm => 
          alarm.topic === "Sensor Subscription Failure" && alarm.active
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
    
    // Subscription successful, set any existing subscription alarms to inactive
    setAlarms(prevAlarms => 
      prevAlarms.map(alarm => {
        if ((alarm.topic === "Sensor Subscription Failure" || 
             alarm.topic === "Sensor Network Error") && alarm.active) {
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
      _id: `sensor-network-failure-${Date.now()}`,
      category: "ALARM", 
      topic: "Sensor Network Error",
      data: {
        "subscription": subscription,
        "message": `Network error while subscribing to sensor status topic`,
        "error": error instanceof Error ? error.message : "Unknown error"
      },
      createdAt: new Date().toISOString(),
      acknowledged: false,
      active: true,
      __v: 0
    };
    
    // Add the alarm to alarms
    setAlarms(prevAlarms => {
      const existingAlarm = prevAlarms.find(alarm => 
        alarm.topic === "Sensor Network Error" && alarm.active
      );
      if (!existingAlarm) {
        return [networkFailureAlarm, ...prevAlarms];
      }
      return prevAlarms;
    });
    return false;
  }
}

// Helper function to handle consumer errors
function handleConsumerError(type: 'fetch' | 'network', error?: any, status?: number, statusText?: string): Event {
  const baseData: {[key: string]: string | number | boolean} = {
    "service": "Sensor Consumer",
    "message": type === 'fetch' 
      ? "Failed to fetch sensor status events from server"
      : "Network error or invalid credentials while fetching sensor status"
  };
  
  if (type === 'fetch') {
    if (status !== undefined) baseData.status = status;
    if (statusText !== undefined) baseData.statusText = statusText;
  } else {
    baseData.error = error instanceof Error ? error.message : "Unknown error";
  }

  return {
    _id: `sensor-consumer-${type}-${Date.now()}`,
    category: "ALARM",
    topic: type === 'fetch' ? "Sensor Consumer Failure" : "Sensor Network Error",
    data: baseData,
    createdAt: new Date().toISOString(),
    acknowledged: false,
    active: true,
    __v: 0
  };
}

async function sensorConsumer(): Promise<{ sensors: SensorStatus[], alarm?: Event }> {
  try{
    const response = await fetch(`${apiUrl}/event/topic/sensor_status`, {credentials: "include"})
    
    if (response.status !== 200 && response.status !== 201) {
      // Return empty sensors with alarm
      const alarm = handleConsumerError('fetch', null, response.status, response.statusText);
      return { sensors: [], alarm };
    }
    
    const json = await response.json();
    const allEvents = Array.isArray(json) ? json : [json];
    
    // Deduplicate at the source - keep only the most recent event per configured sensor
    const sensorMap = new Map<string, SensorStatus>();
    
    allEvents.forEach((event: SensorStatus) => {
      const sensorId = event.data?.Sensor_ID;
      
      // Only process configured sensors
      if (!sensorId || !configSensors.includes(sensorId)) {
        return;
      }
      
      // Keep only the most recent event per sensor
      const existingEvent = sensorMap.get(sensorId);
      if (!existingEvent) {
        sensorMap.set(sensorId, event);
      } else {
        // Compare timestamps and keep the more recent one
        if (new Date(event.createdAt) > new Date(existingEvent.createdAt)) {
          sensorMap.set(sensorId, event);
        }
      }
    });
    
    const sensorStatusEvents = Array.from(sensorMap.values());
    
    return { sensors: sensorStatusEvents };
  }
  catch(error){
    // Return empty sensors with alarm
    const alarm = handleConsumerError('network', error);
    return { sensors: [], alarm };
  }
}

export default function SensorProvider({children}:{children: React.ReactNode}){
  const [sensors, setSensors] = useState<SensorStatus[]>([]);
  const [alarms, setAlarms] = useState<Event[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{[key: string]: 'connected' | 'failed' | 'pending'}>({});
  const [sensorTimestamps, setSensorTimestamps] = useState<{[key: string]: number}>({});
  const { user } = useUserContext();
  const { setHasActiveAlarms } = useToast();
  const pollingReference = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutCheckRef = useRef<NodeJS.Timeout | null>(null);

  const postSensorTimeoutAlarm = async (sensorId: string) => {
    try {
      const alarmData = {
        category: "ALARM",
        topic: "sensor_timeout",
        data: {
          sensorId: sensorId,
          message: `No sensor_status received from ${sensorId} for more than 5 minutes`,
          timeoutDuration: "5 minutes",
          lastSeen: sensorTimestamps[sensorId] ? new Date(sensorTimestamps[sensorId]).toISOString() : "unknown"
        }
      };

      const response = await fetch(`${apiUrl}/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(alarmData)
      });

      if (response.ok) {
        // Timeout alarm posted successfully
      } else {
        console.error(`Failed to post timeout alarm for sensor ${sensorId}:`, response.status);
      }
    } catch (error) {
      console.error(`Error posting timeout alarm for sensor ${sensorId}:`, error);
    }
  };

  const checkSensorTimeouts = async () => {
    const now = Date.now();
    const fiveMinutesMs = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    for (const sensorId of configSensors) {
      const lastSeen = sensorTimestamps[sensorId];
      
      if (lastSeen && (now - lastSeen) > fiveMinutesMs) {
        // Check if we already have an active timeout alarm for this sensor
        const existingAlarm = alarms.find(alarm => 
          alarm.topic === "sensor_timeout" && 
          alarm.data.sensorId === sensorId && 
          alarm.active
        );
        
        if (existingAlarm) {
          // Extend existing alarm by 5 more minutes
          const minutesSinceLastSeen = Math.floor((now - lastSeen) / 60000);
          const updatedMessage = `No sensor_status received from ${sensorId} for more than ${minutesSinceLastSeen} minutes`;
          
          // Update the existing alarm with extended timeout info
          setAlarms(prevAlarms => 
            prevAlarms.map(alarm => {
              if (alarm._id === existingAlarm._id) {
                return {
                  ...alarm,
                  data: {
                    ...alarm.data,
                    message: updatedMessage,
                    timeoutDuration: `${minutesSinceLastSeen} minutes`,
                    lastExtended: new Date().toISOString()
                  },
                  createdAt: new Date().toISOString() // Update timestamp to show latest extension
                };
              }
              return alarm;
            })
          );
          
          // Post updated alarm to API
          try {
            const extendedAlarmData = {
              category: "ALARM",
              topic: "sensor_timeout",
              data: {
                sensorId: sensorId,
                message: updatedMessage,
                timeoutDuration: `${minutesSinceLastSeen} minutes`,
                lastSeen: new Date(lastSeen).toISOString(),
                extended: true
              }
            };

            await fetch(`${apiUrl}/event`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(extendedAlarmData)
            });
          } catch (error) {
            console.error(`Error posting extended timeout alarm for sensor ${sensorId}:`, error);
          }
        } else {
          // Create new timeout alarm for first-time timeout
          await postSensorTimeoutAlarm(sensorId);
          
          const timeoutAlarm: Event = {
            _id: `sensor-timeout-${sensorId}-${Date.now()}`,
            category: "ALARM",
            topic: "sensor_timeout",
            data: {
              service: "Sensor Monitor",
              sensorId: sensorId,
              message: `No sensor_status received from ${sensorId} for more than 5 minutes`,
              timeoutDuration: "5 minutes",
              lastSeen: new Date(lastSeen).toISOString()
            },
            createdAt: new Date().toISOString(),
            acknowledged: false,
            active: true,
            __v: 0
          };
          
          setAlarms(prev => [timeoutAlarm, ...prev]);
        }
      }
    }
  };

  const attemptReconnection = async () => {
    const failedSubscriptions = Object.keys(subscriptionStatus).filter(
      sub => subscriptionStatus[sub] === 'failed'
    );
    
    if (failedSubscriptions.length > 0) {
      await sensorSubscriber(setAlarms, setSubscriptionStatus);
    }
  };

  const consumeData = async () => {
    const result = await sensorConsumer();
    const serverSensors = result.sensors;
    const consumerAlarm = result.alarm;
    
    if (!consumerAlarm) {
      // Connection is working, set any existing consumer alarms to inactive
      setAlarms(prevAlarms => 
        prevAlarms.map(alarm => {
          if ((alarm.topic === "Sensor Consumer Failure" || alarm.topic === "Sensor Network Error") && 
              alarm.data.service === "Sensor Consumer" && alarm.active) {
            return { ...alarm, active: false };
          }
          return alarm;
        })
      );
    } else {
      // Add new consumer alarm if it doesn't already exist
      setAlarms(prevAlarms => {
        const existingAlarm = prevAlarms.find(alarm => 
          alarm.topic === consumerAlarm.topic && 
          alarm.data.service === "Sensor Consumer" && 
          alarm.active
        );
        if (!existingAlarm) {
          return [consumerAlarm, ...prevAlarms];
        }
        return prevAlarms;
      });
    }
    
    // serverSensors is already deduplicated, just need to ensure we have all configured sensors
    const finalSensorMap = new Map<string, SensorStatus>();
    
    // Add the deduplicated server sensors
    serverSensors.forEach(sensor => {
      const sensorId = sensor.data?.Sensor_ID;
      if (sensorId && configSensors.includes(sensorId)) {
        finalSensorMap.set(sensorId, sensor);
        
        // Update sensor timestamp for timeout tracking
        setSensorTimestamps(prev => ({
          ...prev,
          [sensorId]: new Date(sensor.createdAt).getTime()
        }));
        
        // Clear timeout alarms if this is actual sensor data
        if (sensor.topic === "sensor_status" && sensor.category !== "ALARM") {
          setAlarms(prevAlarms => 
            prevAlarms.map(alarm => {
              if (alarm.topic === "sensor_timeout" && 
                  alarm.data.sensorId === sensorId && 
                  alarm.active) {
                return { ...alarm, active: false };
              }
              return alarm;
            })
          );
        }
      }
    });
    
    // Add default entries for configured sensors that don't have real data
    configSensors.forEach(sensorId => {
      if (!finalSensorMap.has(sensorId)) {
        finalSensorMap.set(sensorId, {
          _id: `default_${sensorId}`,
          category: "DETECT" as const,
          topic: "sensor_status",
          data: {
            "Sensor_ID": sensorId,
            "Sensor-type": "Unknown",
            "LAT": 0,
            "LON": 0,
            status: "No data available"
          },
          createdAt: new Date().toISOString(),
          acknowledged: false,
          active: false,
          __v: 0
        } as SensorStatus);
      }
    });
    
    // Set the sensors directly (no need for state function since we're replacing entirely)
    setSensors(Array.from(finalSensorMap.values()));
  }

  const value = {
    sensors: sensors
  };

  // Initial subscription attempt on user login
  useEffect(()=>{
    if( user.username == "" ) return;
    if (!subscriptionStatus["sensor_status"] || subscriptionStatus["sensor_status"] === 'failed') {
      sensorSubscriber(setAlarms, setSubscriptionStatus);
    }
  }, [user])

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

  // Periodic sensor timeout checking
  useEffect(()=>{
    if( user.username == "" ) return;
    
    timeoutCheckRef.current = setInterval(() => {
      checkSensorTimeouts();
    }, 60000); // Check for timeouts every minute

    return () => {
      if (timeoutCheckRef.current) clearInterval(timeoutCheckRef.current);
    }
  }, [sensorTimestamps, alarms])

  // Update toast system when alarms change
  useEffect(() => {
    const hasActiveAlarms = alarms.some(alarm => 
      alarm.category === "ALARM" && alarm.active !== false
    );
    setHasActiveAlarms(hasActiveAlarms);
  }, [alarms, setHasActiveAlarms]);

  useEffect(()=>{
    if( user.username == "" ) return;
    consumeData();
    pollingReference.current = setInterval(consumeData,pollingIntervalMs);

    return () => {
      if (pollingReference.current) clearInterval(pollingReference.current);
    }
  },[user])

  return(
    <SensorContext.Provider value={value}>
      {children}
    </SensorContext.Provider>
  );
};

export { SensorContext };