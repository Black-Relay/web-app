import React, { useState, useMemo, useEffect } from "react";
import { useSensorContext } from "@/providers/SensorProvider";
import type { SensorStatus } from "@/providers/SensorProvider";
import config from "@/configs/config.json";
import "@/css/historical-data-view.css";

const { apiUrl } = {
  apiUrl: import.meta.env.VITE_API_URL || config.apiUrl
};

interface HistoricalDataViewProps {
  sensorId: string;
}

export function HistoricalDataView({ sensorId }: HistoricalDataViewProps) {
  const { sensors } = useSensorContext();
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [historicalEvents, setHistoricalEvents] = useState<SensorStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get current sensor data for reference
  const currentSensor = sensors.find(sensor => sensor.data?.Sensor_ID === sensorId);
  
  // Fetch historical sensor data from API
  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!sensorId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${apiUrl}/event/topic/sensor_status`, {
          credentials: "include"
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch historical data: ${response.status}`);
        }
        
        const events = await response.json();
        const eventsArray = Array.isArray(events) ? events : [events];
        
        // Filter events for the specific sensor and sort by timestamp
        const sensorEvents = eventsArray
          .filter((event: SensorStatus) => event.data?.Sensor_ID === sensorId)
          .sort((a: SensorStatus, b: SensorStatus) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        
        setHistoricalEvents(sensorEvents);
      } catch (err) {
        console.error('Error fetching historical data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistoricalData();
  }, [sensorId, timeRange]); // Refetch when sensor or time range changes
  
  // Get available data fields from current sensor (excluding basic fields)
  const availableFields = useMemo(() => {
    if (!currentSensor?.data) return [];
    
    const excludedFields = new Set(['Sensor_ID', 'Sensor-type', 'LAT', 'LON']);
    return Object.keys(currentSensor.data).filter(key => !excludedFields.has(key));
  }, [currentSensor]);
  
  // Process historical data for the selected time range
  const historicalData = useMemo(() => {
    if (historicalEvents.length === 0) return [];
    
    // Calculate time range cutoff
    const now = new Date();
    const timeRangeHours = {
      '1h': 1,
      '24h': 24,
      '7d': 168,
      '30d': 720
    }[timeRange] || 24;
    
    const cutoffTime = new Date(now.getTime() - (timeRangeHours * 60 * 60 * 1000));
    
    // Filter events within the time range and transform them
    return historicalEvents
      .filter(event => new Date(event.createdAt) >= cutoffTime)
      .map(event => ({
        timestamp: new Date(event.createdAt),
        ...Object.fromEntries(
          availableFields.map(field => [field, event.data[field]])
        ),
        status: event.category,
        eventId: event._id
      }));
  }, [historicalEvents, timeRange, availableFields]);
  
  // Calculate trends and statistics for numeric fields
  const statistics = useMemo(() => {
    if (historicalData.length === 0) return null;
    
    // Get numeric fields from available data
    const numericFields = availableFields.filter(field => {
      const value = currentSensor?.data?.[field];
      return typeof value === 'number';
    });
    
    if (numericFields.length === 0) return null;
    
    const stats: {[key: string]: any} = {};
    
    numericFields.forEach(metric => {
      const values = historicalData
        .map(d => (d as any)[metric])
        .filter(v => typeof v === 'number') as number[];
      
      if (values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        
        stats[metric] = {
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          median: sorted[Math.floor(sorted.length / 2)],
          trend: values.length > 1 ? values[values.length - 1] - values[0] : 0
        };
      }
    });
    
    return Object.keys(stats).length > 0 ? stats : null;
  }, [historicalData, availableFields, currentSensor]);
  
  // Historical alerts
  const alerts = useMemo(() => {
    return historicalData
      .filter(d => d.status === 'ALARM' || d.status === 'ALERT')
      .slice(-10) // Last 10 alerts
      .reverse();
  }, [historicalData]);
  
  // Export functionality
  const exportData = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      const headers = ['Timestamp', ...availableFields, 'Status'];
      const csvContent = [
        headers.join(','),
        ...historicalData.map(d => {
          const row = [d.timestamp.toISOString()];
          availableFields.forEach(field => {
            const value = (d as any)[field];
            row.push(typeof value === 'number' ? value.toFixed(2) : String(value || ''));
          });
          row.push(d.status);
          return row.join(',');
        })
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sensor-${sensorId}-${timeRange}-data.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const jsonContent = JSON.stringify(historicalData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sensor-${sensorId}-${timeRange}-data.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  
  if (!currentSensor) {
    return <p className="no-data">No sensor selected for historical analysis</p>;
  }
  
  if (loading) {
    return (
      <div className="historical-data-view">
        <p className="loading-message">Loading historical data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="historical-data-view">
        <div className="error-message">
          <p>Error loading historical data: {error}</p>
          <button 
            className="retry-btn" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="historical-data-view">
      {/* Time Range Controls */}
      <div className="time-range-controls">
        <label>Time Range:</label>
        <div className="time-range-buttons">
          {['1h', '24h', '7d', '30d'].map(range => (
            <button
              key={range}
              className={`time-btn ${timeRange === range ? 'active' : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      {/* Data Summary */}
      <div className="data-summary">
        <p className="summary-text">
          Showing {historicalData.length} data points from {historicalEvents.length} total events for sensor {sensorId}
        </p>
      </div>
      
      {/* Statistics Summary */}
      {statistics && (
        <div className="statistics-grid">
          <h4>Data Summary ({timeRange})</h4>
          <div className="stats-cards">
            {Object.entries(statistics).map(([metric, stats]) => (
              <div key={metric} className="stat-card">
                <div className="stat-header">
                  <span className="stat-name">{metric.charAt(0).toUpperCase() + metric.slice(1)}</span>
                  <span className={`trend ${stats.trend > 0 ? 'up' : stats.trend < 0 ? 'down' : 'stable'}`}>
                    {stats.trend > 0 ? '↗' : stats.trend < 0 ? '↘' : '→'}
                  </span>
                </div>
                <div className="stat-values">
                  <div>Avg: {stats.avg.toFixed(1)}</div>
                  <div>Min: {stats.min.toFixed(1)}</div>
                  <div>Max: {stats.max.toFixed(1)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Simple Chart Visualization */}
      <div className="chart-section">
        <h4>Sensor Readings Over Time</h4>
        <div className="simple-chart">
          {historicalData.length > 0 && availableFields.some(field => typeof currentSensor?.data?.[field] === 'number') ? (
            <div className="chart-container">
              {availableFields.filter(field => typeof currentSensor?.data?.[field] === 'number').map(metric => {
                const values = historicalData
                  .map(d => (d as any)[metric])
                  .filter(v => typeof v === 'number') as number[];
                
                if (values.length === 0) return null;
                
                const min = Math.min(...values);
                const max = Math.max(...values);
                const range = max - min || 1;
                
                return (
                  <div key={metric} className="chart-line">
                    <label>{metric.charAt(0).toUpperCase() + metric.slice(1)}</label>
                    <div className="line-chart">
                      {values.map((value, i) => {
                        const height = ((value - min) / range) * 100;
                        return (
                          <div
                            key={i}
                            className="chart-bar"
                            style={{ height: `${height}%` }}
                            title={`${metric}: ${value.toFixed(1)}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-data">No numeric data available for charting</p>
          )}
        </div>
      </div>
      
      {/* Historical Alerts */}
      <div className="alerts-section">
        <h4>Recent Alerts & Events</h4>
        <div className="alerts-list">
          {alerts.length > 0 ? (
            alerts.map((alert, i) => (
              <div key={i} className={`alert-item ${alert.status.toLowerCase()}`}>
                <span className="alert-time">{alert.timestamp.toLocaleString()}</span>
                <span className="alert-status">{alert.status}</span>
                <span className="alert-details">
                  {availableFields.length > 0 ? 
                    availableFields.slice(0, 2).map(field => {
                      const value = (alert as any)[field];
                      return typeof value === 'number' ? 
                        `${field}: ${value.toFixed(1)}` : 
                        `${field}: ${value}`;
                    }).join(', ') :
                    'Alert detected'
                  }
                </span>
              </div>
            ))
          ) : (
            <p className="no-data">No alerts in selected time range</p>
          )}
        </div>
      </div>
      
      {/* Export Controls */}
      <div className="export-section">
        <h4>Export Data</h4>
        <div className="export-buttons">
          <button className="export-btn" onClick={() => exportData('csv')}>
            Download CSV
          </button>
          <button className="export-btn" onClick={() => exportData('json')}>
            Download JSON
          </button>
        </div>
        <p className="export-info">
          Export includes {historicalData.length} data points from the selected {timeRange} time range.
        </p>
      </div>
    </div>
  );
}