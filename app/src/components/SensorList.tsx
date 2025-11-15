import { useState } from "react";
import { useSensorContext } from "@/providers/SensorProvider";
import { Lamp } from "@/components/ui/lamp";
import config from "@/configs/config.json";
import "../css/sensor-group.css";

interface SensorListProps {
  title?: string;
  onSensorSelect?: (sensorId: string) => void;
}

export function SensorList({ title = "Sensors by Type", onSensorSelect }: SensorListProps) {
  const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({});
  const { sensors } = useSensorContext();
  
  // Get configured sensors from config.json
  const configuredSensors = config.sensors;
  
  // Match configured sensors with actual sensor data and determine lamp status
  const sensorStatuses = configuredSensors.map(sensorId => {
    const sensorData = sensors.find(sensor => sensor.data?.Sensor_ID === sensorId);
    
    let lampState: "" | "active" | "active-alarm" = ""; // Default: not lit
    if (sensorData) {
      // Check if sensor type is "Unknown" for grey state
      if (sensorData.data?.["Sensor-type"] === "Unknown") {
        lampState = ""; // Grey for unknown sensor type
      } else if (sensorData.category === 'ALARM') {
        lampState = "active-alarm"; // Red for alarm
      } else if (sensorData.category === 'DETECT') {
        lampState = "active"; // Green for detect (normal operation)
      }
    }
    
    return {
      id: sensorId,
      status: sensorData ? 'active' : 'inactive',
      lampState: lampState,
      category: sensorData?.category,
      sensorType: sensorData?.data?.["Sensor-type"] || "Unknown",
      lastUpdate: sensorData?.createdAt,
      data: sensorData
    };
  });

  // Group sensors by sensor type
  const groupedSensors = sensorStatuses.reduce((groups, sensor) => {
    const type = sensor.sensorType;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(sensor);
    return groups;
  }, {} as {[key: string]: typeof sensorStatuses});

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Determine the highest alarm state for a group
  const getGroupAlarmState = (sensorsInGroup: typeof sensorStatuses) => {
    const hasAlarm = sensorsInGroup.some(sensor => sensor.lampState === 'active-alarm');
    const hasActive = sensorsInGroup.some(sensor => sensor.lampState === 'active');
    const hasUnknownType = sensorsInGroup.some(sensor => sensor.sensorType === 'Unknown');
    
    if (hasAlarm) return 'alarm';
    if (hasActive) return 'good';
    if (hasUnknownType) return 'unknown';
    return 'default';
  };

  return (
    <div className="sensor-wrapper">
      {Object.entries(groupedSensors).map(([sensorType, sensorsInGroup]) => {
        const groupAlarmState = getGroupAlarmState(sensorsInGroup);
        return (
          <div key={sensorType} className="sensor-group">
            <button 
              className={`collapsible ${expandedGroups[sensorType] ? "active" : ""} ${groupAlarmState}`}
              onClick={() => toggleGroup(sensorType)}
            >
              {sensorType} ({sensorsInGroup.length})
            </button>
          <div className="content">
            {sensorsInGroup.map((sensor, index) => (
              <div 
                key={`sensor-${sensor.id}-${index}`} 
                className={`sensor-item ${sensor.status} ${onSensorSelect ? 'clickable' : ''}`}
                onClick={() => onSensorSelect?.(sensor.id)}
              >
                <div className="sensor-info">
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
        </div>
        );
      })}
    </div>
  );
}