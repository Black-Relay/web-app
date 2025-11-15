import { useSensorContext } from "@/providers/SensorProvider";
import type { SensorStatus } from "@/providers/SensorProvider";

interface SensorDetailProps {
  sensorId: string;
}

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
        <div className="sensor-detail-todo">
          <h3>TODO</h3>
          <p>No sensor data available</p>
        </div>
      </div>
    );
  }

  // Determine status based on sensor category
  const getStatusInfo = (category: string) => {
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

  const statusInfo = getStatusInfo(sensorData.category);
  
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
      
      <div className="sensor-detail-todo">
        <h3>TODO</h3>
        <ul>
          <li>Add sensor configuration options</li>
          <li>Implement sensor control commands</li>
          <li>Add historical data view</li>
          <li>Setup sensor alerts and notifications</li>
        </ul>
      </div>
    </div>
  );
}