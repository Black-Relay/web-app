import React from "react";
import { useSensorContext } from "@/providers/SensorProvider";
import type { SensorStatus } from "@/providers/SensorProvider";
import { HistoricalDataView } from "./historical-data-view";

interface SensorDetailProps {
  sensorId: string;
}

// Helper function to render nested data structures
const renderDataValue = (key: string, value: any, level: number = 0) => {
  const indent = level * 20;
  
  if (value === null || value === undefined) {
    return (
      <div key={key} className="sensor-data-item" style={{ marginLeft: `${indent}px` }}>
        <span className="data-label">{key}:</span>
        <span className="data-value">null</span>
      </div>
    );
  }
  
  if (typeof value === 'object' && !Array.isArray(value)) {
    return (
      <div key={key} className="sensor-data-group" style={{ marginLeft: `${indent}px` }}>
        <div className="data-group-header">{key}:</div>
        <div className="data-group-content">
          {Object.entries(value).map(([subKey, subValue]) => 
            renderDataValue(subKey, subValue, level + 1)
          )}
        </div>
      </div>
    );
  }
  
  if (Array.isArray(value)) {
    return (
      <div key={key} className="sensor-data-group" style={{ marginLeft: `${indent}px` }}>
        <div className="data-group-header">{key}:</div>
        <div className="data-group-content">
          {value.map((item, index) => 
            renderDataValue(`[${index}]`, item, level + 1)
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div key={key} className="sensor-data-item" style={{ marginLeft: `${indent}px` }}>
      <span className="data-label">{key}:</span>
      <span className="data-value">{String(value)}</span>
    </div>
  );
};

// Helper function to render all sensor data excluding already displayed fields
const renderSensorData = (sensorData: any) => {
  if (!sensorData || !sensorData.data) return <p className="no-data">No additional data available</p>;
  
  // Fields already displayed in the core section
  const excludedFields = new Set(['Sensor_ID', 'Sensor-type', 'LAT', 'LON']);
  
  // Get all data from the sensor data object (only from sensorData.data)
  const additionalData: {[key: string]: any} = {};
  
  // Add fields from sensorData.data (excluding already shown ones)
  Object.entries(sensorData.data).forEach(([key, value]) => {
    if (!excludedFields.has(key)) {
      additionalData[key] = value;
    }
  });
  
  if (Object.keys(additionalData).length === 0) {
    return <p className="no-data">No additional data</p>;
  }
  
  return Object.entries(additionalData).map(([key, value]) => 
    renderDataValue(key, value)
  );
};

// Helper function to render historical data
const renderHistoricalData = (sensorId: string) => {
  return <HistoricalDataView sensorId={sensorId} />;
};

export function SensorDetail({ sensorId }: SensorDetailProps) {
  const { sensors } = useSensorContext();
  
  // Find the sensor data for the given sensor ID
  const sensorData = sensors.find(sensor => sensor.data.Sensor_ID === sensorId);
  
  if (!sensorData) {
    return (
      <div className="sensor-detail">
        <header className="sensor-detail-header">
          <h2>{sensorId}</h2>
        </header>
        <div className="sensor-detail-core">
          <div className="sensor-detail-item-inline">
            <div className="sensor-detail-inline-group">
              <span className="label">Sensor:</span>
              <span className="value">{sensorId}</span>
            </div>
            <div className="sensor-detail-inline-group">
              <span className="label">Category:</span>
              <span className="value">Unknown</span>
            </div>
            <div className="sensor-detail-inline-group">
              <span className="label">Status:</span>
              <span className="value status no-status">No Status</span>
            </div>
          </div>
          <div className="sensor-detail-item-inline">
            <div className="sensor-detail-inline-group">
              <span className="label">Location:</span>
              <span className="value">Unknown</span>
            </div>
            <div className="sensor-detail-inline-group">
              <span className="label">Last Update:</span>
              <span className="value">Never</span>
            </div>
          </div>
        </div>
        
        <div className="sensor-detail-data">
          <h3>Additional Data</h3>
          <div className="sensor-data-content">
            <p className="no-data">No additional data</p>
          </div>
        </div>
        
        <div className="sensor-detail-history">
          <h3>Historical Data</h3>
          <div className="history-content">
            <p className="no-data">No sensor selected</p>
          </div>
        </div>
      </div>
    );
  }

  // Determine status based on sensor category and type
  const getStatusInfo = (category: string, sensorType?: string) => {
    // Check if sensor type is Unknown first
    if (sensorType === "Unknown") {
      return { text: "Unknown", className: "no-status" };
    }
    
    switch (category) {
      case "DETECT":
        return { text: "Healthy", className: "healthy" };
      case "ALERT":
      case "ALARM":
      case "THREAT":
        return { text: "Alarm", className: "alarm" };
      default:
        return { text: "No Status", className: "no-status" };
    }
  };

  const statusInfo = getStatusInfo(sensorData.category, sensorData.data?.["Sensor-type"]);
  
  // Format location
  const location = `${sensorData.data.LAT}, ${sensorData.data.LON}`;
  
  // Format last update
  const lastUpdate = new Date(sensorData.createdAt).toLocaleString();

  return (
    <div className="sensor-detail">
      <header className="sensor-detail-header">
        <h2>{sensorId}</h2>
      </header>
      
      <div className="sensor-detail-core">
        <div className="sensor-detail-item-inline">
          <div className="sensor-detail-inline-group">
            <span className="label">Sensor:</span>
            <span className="value">{sensorData.data.Sensor_ID}</span>
          </div>
          <div className="sensor-detail-inline-group">
            <span className="label">Category:</span>
            <span className="value">{sensorData.data["Sensor-type"]}</span>
          </div>
          <div className="sensor-detail-inline-group">
            <span className="label">Status:</span>
            <span className={`value status ${statusInfo.className}`}>
              {statusInfo.text}
            </span>
          </div>
        </div>
        
        <div className="sensor-detail-item-inline">
          <div className="sensor-detail-inline-group">
            <span className="label">Location:</span>
            <span className="value">{location}</span>
          </div>
          <div className="sensor-detail-inline-group">
            <span className="label">Last Update:</span>
            <span className="value">{lastUpdate}</span>
          </div>
        </div>
      </div>
      
      <div className="sensor-detail-data">
        <h3>Additional Data</h3>
        <div className="sensor-data-content">
          {renderSensorData(sensorData)}
        </div>
      </div>
      
      <div className="sensor-detail-history">
        <h3>Historical Data</h3>
        <div className="history-content">
          {renderHistoricalData(sensorId)}
        </div>
      </div>
    </div>
  );
}