import { useState } from "react";
import { Lamp } from "@/components/ui/lamp";
import { SensorDataOnly } from "@/components/sensor-data-only";
import "../css/sensor-group.css";
import type { Sensor } from "@/providers/SensorProvider";
import { useSensorContext } from "@/providers/SensorProvider";

export default function SensorGroup({name, sensors}:{name: string, sensors:Sensor[]}){
  const [toggleOn, setToggleOn] = useState<boolean>(false);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const { sensors: sensorStatuses } = useSensorContext();

  // Convert sensors to match SensorList format and determine lamp states
  const sensorItems = sensors.map(sensor => {
    const sensorStatus = sensorStatuses.find(status => status.data?.Sensor_ID === sensor.Sensor_ID);
    
    let lampState: "" | "active" | "active-alarm" = "";
    if (sensorStatus) {
      // Check if sensor type is "Unknown" for grey state
      if (sensorStatus.data?.["Sensor-type"] === "Unknown") {
        lampState = ""; // Grey for unknown sensor type
      } else if (sensorStatus.category === 'ALARM') {
        lampState = "active-alarm"; // Red for alarm
      } else if (sensorStatus.category === 'DETECT') {
        lampState = "active"; // Green for detect (normal operation)
      }
    }

    return {
      id: sensor.Sensor_ID,
      lampState: lampState,
      lastUpdate: sensorStatus?.createdAt,
      sensorType: sensor["Sensor-type"] || "Unknown"
    };
  });

  // Determine group alarm state like SensorList
  const getGroupAlarmState = () => {
    const hasAlarm = sensorItems.some(sensor => sensor.lampState === 'active-alarm');
    const hasActive = sensorItems.some(sensor => sensor.lampState === 'active');
    const hasUnknownType = sensorItems.some(sensor => sensor.sensorType === 'Unknown');
    
    if (hasAlarm) return 'alarm';
    if (hasActive) return 'good';
    if (hasUnknownType) return 'unknown';
    return 'default';
  };

  const groupAlarmState = getGroupAlarmState();

  return (<div className="sensor-group">
    <button 
      className={`collapsible ${toggleOn ? "active" : ""} ${groupAlarmState}`} 
      onClick={()=>{setToggleOn(!toggleOn)}}
    >
      {name} ({sensors.length})
    </button>
    <div className="content">
      {sensorItems.map((sensor, index) => (
        <div key={`sensor-${name}-${index}`} className={`sensor-item ${sensor.lampState ? 'active' : 'inactive'} clickable`}>
          <div 
            className="sensor-info"
            onClick={() => setSelectedSensor(sensor.id)}
          >
            <div className="sensor-id-with-lamp">
              <Lamp state={sensor.lampState} />
              <span className="sensor-id">{sensor.id}</span>
            </div>
          </div>
          {sensor.lastUpdate && (
            <div className="sensor-timestamp">
              Last update: {new Date(sensor.lastUpdate).toLocaleTimeString()}
            </div>
          )}
        </div>
      ))}
    </div>
    
    {/* Sensor Sheet */}
    {selectedSensor && (
      <div className="sensor-sheet-overlay" onClick={() => setSelectedSensor(null)}>
        <div className="sensor-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="sensor-sheet-header">
            <div className="sheet-handle"></div>
            <h3>Sensor Details</h3>
            <button 
              className="close-button" 
              onClick={() => setSelectedSensor(null)}
            >
              ×
            </button>
          </div>
          <div className="sensor-sheet-content">
            <SensorDataOnly sensorId={selectedSensor} />
          </div>
        </div>
      </div>
    )}
  </div>)
}