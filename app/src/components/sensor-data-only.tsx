import React from 'react';
import { useSensorContext } from '../providers/SensorProvider';
import { Lamp } from './ui/lamp';

interface SensorDataOnlyProps {
  sensorId: string;
}

export function SensorDataOnly({ sensorId }: SensorDataOnlyProps) {
  const { sensors } = useSensorContext();
  
  // Find the sensor data
  const sensorData = sensors.find(sensor => sensor.data?.Sensor_ID === sensorId);
  
  if (!sensorData || !sensorData.data) {
    return (
      <div className="sensor-data-container">
        <div className="no-data-message">
          <p>No data available for sensor {sensorId}</p>
        </div>
      </div>
    );
  }

  const data = sensorData.data;

  // Determine lamp state based on sensor category
  let lampState: "" | "active" | "active-alarm" = "";
  if (data["Sensor-type"] === "Unknown") {
    lampState = "";
  } else if (sensorData.category === "ALARM") {
    lampState = "active-alarm";
  } else if (sensorData.category === "DETECT") {
    lampState = "active";
  }

  // Format timestamp
  const lastUpdate = sensorData.createdAt ? new Date(sensorData.createdAt).toLocaleString() : 'Unknown';

  return (
    <div className="sensor-data-container">
      {/* Main Sensor Information */}
      <div className="sensor-info-section">
        <div className="sensor-header">
          <div className="sensor-title-with-lamp">
            <Lamp state={lampState} />
            <h2>{data.Sensor_ID}</h2>
          </div>
        </div>

        <div className="sensor-details-grid">
          <div className="detail-item">
            <span className="detail-label">Type:</span>
            <span className="detail-value">{data["Sensor-type"] || 'Unknown'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status:</span>
            <span className={`detail-value status-${sensorData.category.toLowerCase()}`}>
              {sensorData.category === 'DETECT' ? 'Normal' : 
               sensorData.category === 'ALARM' ? 'Alarm' : 
               sensorData.category}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Location:</span>
            <span className="detail-value">
              Lat: {data.LAT || 'N/A'}, Lng: {data.LON || 'N/A'}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Last Update:</span>
            <span className="detail-value">{lastUpdate}</span>
          </div>
        </div>
      </div>

      {/* Sensor Values */}
      <div className="sensor-values-section">
        <h3>Current Values</h3>
        <div className="values-grid">
          {Object.entries(data).map(([key, value]) => {
            // Skip metadata fields
            if (['Sensor_ID', 'Sensor-type', 'LAT', 'LON'].includes(key)) {
              return null;
            }
            
            return (
              <div key={key} className="value-item">
                <span className="value-label">{key}:</span>
                <span className="value-data">{String(value)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}