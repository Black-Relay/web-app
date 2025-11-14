import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useUserContext } from "./UserProvider";
import { useToast } from './ToastProvider';
import config from "../configs/config.json";
const { apiUrl, pollingIntervalMs, configSensors } = {
  apiUrl: import.meta.env.VITE_API_URL || config.apiUrl,
  pollingIntervalMs: Number(import.meta.env.VITE_POLLING_INTERVAL_MS) || config.pollingIntervalMs,
  configSensors: config.sensors
};

type SensorStatus = {
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

interface SensorContextType {
  sensors: SensorStatus[];
}

const SensorContext = createContext<SensorContextType|null>(null);

export function useSensorContext():SensorContextType{
  const value:SensorContextType|null = useContext(SensorContext);
  if (!value) throw new Error('useSensorContext hook used without SensorContext');
  return value;
}

async function sensorSubscriber(
  setLocalAlarms: React.Dispatch<React.SetStateAction<SensorStatus[]>>,
  setSubscriptionStatus: React.Dispatch<React.SetStateAction<{[key: string]: 'connected' | 'failed' | 'pending'}>>
){
  const subscription = "sensor_status";
  try {
    // Set status to pending
    setSubscriptionStatus(prev => ({ ...prev, [subscription]: 'pending' }));
    
    const response = await fetch(`${apiUrl}/topic/${subscription}/subscribe`, {credentials: "include"});
    console.log('Sensor subscription response:', response);
    
    if (response.status !== 200 && response.status !== 201) {
      // Set status to failed
      setSubscriptionStatus(prev => ({ ...prev, [subscription]: 'failed' }));
      
      // Generate alarm event for subscription failure
      const subscriptionFailureAlarm: SensorStatus = {
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
      
      // Add the alarm to local alarms
      setLocalAlarms(prevAlarms => {
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
    setLocalAlarms(prevAlarms => 
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
    const networkFailureAlarm: SensorStatus = {
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
    
    // Add the alarm to local alarms
    setLocalAlarms(prevAlarms => {
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

async function sensorConsumer(){
  try{
    const response = await fetch(`${apiUrl}/event`, {credentials: "include"})
    
    if (response.status !== 200 && response.status !== 201) {
      // Generate alarm event for sensor consumer failure
      return [{
        _id: `sensor-consumer-failure-${Date.now()}`,
        category: "ALARM",
        topic: "Sensor Consumer Failure",
        data: {
          "service": "Sensor Consumer",
          "message": `Failed to fetch sensor status events from server`,
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
    const allEvents = Array.isArray(json) ? json : [json];
    
    // Filter to only include sensor_status events from configured sensors
    return allEvents.filter((event: SensorStatus) => {
      if (event.topic !== "sensor_status") return false;
      
      // Check if the event is from a configured sensor
      const sensorId = event.data?.sensorId as string || event.data?.sensor_id as string;
      return configSensors.includes(sensorId);
    });
  }
  catch(error){
    return [{
      _id: `sensor-consumer-error-${Date.now()}`,
      category: "ALARM",
      topic: "Sensor Network Error",
      data: {
        "service": "Sensor Consumer",
        "message": "Network error or invalid credentials while fetching sensor status",
        "error": error instanceof Error ? error.message : "Unknown error"
      },
      createdAt: new Date().toISOString(),
      acknowledged: false,
      active: true,
      __v: 0
    }]
  }
}

export default function SensorProvider({children}:{children: React.ReactNode}){
  const [sensors, setSensors] = useState<SensorStatus[]>([]);
  const [localAlarms, setLocalAlarms] = useState<SensorStatus[]>([]);
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
        console.log(`Posted timeout alarm for sensor ${sensorId}`);
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
        const existingAlarm = localAlarms.find(alarm => 
          alarm.topic === "sensor_timeout" && 
          alarm.data.sensorId === sensorId && 
          alarm.active
        );
        
        if (existingAlarm) {
          // Extend existing alarm by 5 more minutes
          const minutesSinceLastSeen = Math.floor((now - lastSeen) / 60000);
          const updatedMessage = `No sensor_status received from ${sensorId} for more than ${minutesSinceLastSeen} minutes`;
          
          // Update the existing alarm with extended timeout info
          setLocalAlarms(prevAlarms => 
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
          
          const timeoutAlarm: SensorStatus = {
            _id: `sensor-timeout-${sensorId}-${Date.now()}`,
            category: "ALARM",
            topic: "sensor_timeout",
            data: {
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
          
          setLocalAlarms(prev => [timeoutAlarm, ...prev]);
        }
      }
    }
  };

  const attemptReconnection = async () => {
    const failedSubscriptions = Object.keys(subscriptionStatus).filter(
      sub => subscriptionStatus[sub] === 'failed'
    );
    
    if (failedSubscriptions.length > 0) {
      console.log('Attempting to reconnect failed sensor subscriptions:', failedSubscriptions);
      await sensorSubscriber(setLocalAlarms, setSubscriptionStatus);
    }
  };

  const consumeData = async () => {
    let serverSensors = await sensorConsumer();
    
    // Check if sensorConsumer returned an alarm (connection issue)
    const hasConsumerAlarm = serverSensors.some((sensor: SensorStatus) => 
      sensor.topic === "Sensor Consumer Failure" || sensor.topic === "Sensor Network Error"
    );
    
    if (!hasConsumerAlarm) {
      // Connection is working, set any existing consumer alarms to inactive
      setLocalAlarms(prevAlarms => 
        prevAlarms.map(alarm => {
          if ((alarm.topic === "Sensor Consumer Failure" || alarm.topic === "Sensor Network Error") && 
              alarm.data.service === "Sensor Consumer" && alarm.active) {
            return { ...alarm, active: false };
          }
          return alarm;
        })
      );
    } else {
      // Add new consumer alarm to local alarms if it doesn't already exist
      const newAlarm = serverSensors.find((sensor: SensorStatus) => 
        sensor.topic === "Sensor Consumer Failure" || sensor.topic === "Sensor Network Error"
      );
      if (newAlarm) {
        setLocalAlarms(prevAlarms => {
          const existingAlarm = prevAlarms.find(alarm => 
            alarm.topic === newAlarm.topic && 
            alarm.data.service === "Sensor Consumer" && 
            alarm.active
          );
          if (!existingAlarm) {
            return [newAlarm, ...prevAlarms];
          }
          return prevAlarms;
        });
      }
      // Filter out alarm from server sensors since we're managing it locally
      serverSensors = serverSensors.filter((sensor: SensorStatus) => 
        !(sensor.topic === "Sensor Consumer Failure" || 
          (sensor.topic === "Sensor Network Error" && sensor.data.service === "Sensor Consumer"))
      );
    }
    
    // Combine server sensors with local alarms and keep only most recent per sensor
    setSensors(prevSensors => {
      const allSensors = [...localAlarms, ...serverSensors.reverse()];
      
      // Group sensors by sensorId, keeping only the most recent for each
      const sensorMap = new Map<string, SensorStatus>();
      
      allSensors.forEach(sensor => {
        const sensorId = sensor.data?.sensorId as string || sensor.data?.sensor_id as string;
        
        // Skip if no sensorId (for alarms and other non-sensor events)
        if (!sensorId) {
          // Always include alarms and other events without sensorId
          sensorMap.set(sensor._id, sensor);
          return;
        }
        
        // Update sensor timestamp for timeout tracking
        if (sensor.topic === "sensor_status") {
          setSensorTimestamps(prev => ({
            ...prev,
            [sensorId]: new Date(sensor.createdAt).getTime()
          }));
          
          // Only clear timeout alarms if this is actual sensor data (not a timeout alarm)
          if (sensor.topic === "sensor_status" && sensor.category !== "ALARM") {
            setLocalAlarms(prevAlarms => 
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
        
        // Check if we already have a sensor with this ID
        const existingSensor = sensorMap.get(sensorId);
        if (!existingSensor || new Date(sensor.createdAt) > new Date(existingSensor.createdAt)) {
          sensorMap.set(sensorId, sensor);
        }
      });
      
      const finalSensors = Array.from(sensorMap.values()).slice(0, 400);
      
      // Add default sensor objects for configured sensors with no data
      const sensorsWithData = new Set<string>();
      finalSensors.forEach(sensor => {
        const sensorId = sensor.data?.sensorId as string || sensor.data?.sensor_id as string;
        if (sensorId && sensor.topic === "sensor_status") {
          sensorsWithData.add(sensorId);
        }
      });
      
      // Create default sensor status objects for configured sensors without data
      const missingSensors = configSensors
        .filter(sensorId => !sensorsWithData.has(sensorId))
        .map(sensorId => ({
          _id: `default_${sensorId}`,
          category: "DETECT" as const,
          topic: "sensor_status",
          data: {
            sensorId: sensorId,
            sensorType: "Unknown",
            status: "No data available",
            lat: 0,
            lon: 0
          },
          createdAt: new Date().toISOString(),
          acknowledged: false,
          active: false,
          __v: 0
        } as SensorStatus));
      
      const allSensorsWithDefaults = [...finalSensors, ...missingSensors];
      
      // Check for active sensor alarms and update toast system
      const hasSensorAlarms = allSensorsWithDefaults.some(sensor => 
        sensor.category === "ALARM" && sensor.active !== false
      );
      
      setHasActiveAlarms(hasSensorAlarms);
      
      return allSensorsWithDefaults;
    });
  }

  const value = {
    sensors: sensors
  };

  // Initial subscription attempt on user login
  useEffect(()=>{
    if( user.username == "" ) return;
    if (!subscriptionStatus["sensor_status"] || subscriptionStatus["sensor_status"] === 'failed') {
      sensorSubscriber(setLocalAlarms, setSubscriptionStatus);
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
  }, [sensorTimestamps, localAlarms])

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
export type { SensorStatus, SensorContextType };