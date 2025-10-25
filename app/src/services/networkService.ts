// Network data service - Easy integration point for backend
// Backend developer: Replace these functions with real API calls

import type { Node } from "reactflow";
import type { SimpleNodeData } from "@/components/SimpleNetworkNode";

export interface NetworkDevice {
  id: string;
  label: string;
  type:
    | "switch"
    | "server"
    | "firewall"
    | "wireless"
    | "router"
    | "workstation"
    | "camera"
    | "microphone";
  status: "online" | "warning" | "offline";
  ip: string;
  parent?: string;
  children?: string[];
}

export interface NetworkTopology {
  devices: NetworkDevice[];
  connections: Array<{
    from: string;
    to: string;
    style?: any;
  }>;
}

export interface DeviceDetails {
  id: string;
  name: string;
  type: string;
  status: string;
  ip: string;
  lastSeen: string;
  manufacturer?: string;
  uptime?: string;
  [key: string]: any; // Additional device-specific data
}

// TODO: Backend Developer - Replace these mock functions with real API calls

/**
 * Fetch network topology data
 * Backend: Replace with GET /network/topology or similar endpoint
 */
export async function fetchNetworkTopology(): Promise<NetworkTopology> {
  // TODO: Replace with: return fetch('/api/network/topology').then(r => r.json())

  // Mock data for development
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        devices: [
          {
            id: "core",
            label: "Core Switch",
            type: "switch",
            status: "online",
            ip: "192.168.1.1",
          },
          {
            id: "web-server",
            label: "Web Server",
            type: "server",
            status: "online",
            ip: "192.168.1.100",
            parent: "core",
          },
          {
            id: "db-server",
            label: "Database",
            type: "server",
            status: "warning",
            ip: "192.168.1.101",
            parent: "core",
          },
          {
            id: "wireless",
            label: "Wireless AP",
            type: "wireless",
            status: "online",
            ip: "192.168.1.20",
            parent: "core",
          },
          {
            id: "camera-1",
            label: "Security Camera 1",
            type: "camera",
            status: "online",
            ip: "192.168.1.150",
            parent: "wireless",
          },
          {
            id: "camera-2",
            label: "Security Camera 2",
            type: "camera",
            status: "warning",
            ip: "192.168.1.151",
            parent: "wireless",
          },
          {
            id: "microphone-1",
            label: "Audio Sensor 1",
            type: "microphone",
            status: "online",
            ip: "192.168.1.160",
            parent: "core",
          },
        ],
        connections: [
          { from: "core", to: "web-server" },
          { from: "core", to: "db-server" },
          { from: "core", to: "wireless" },
          { from: "core", to: "microphone-1" },
          { from: "wireless", to: "camera-1" },
          { from: "wireless", to: "camera-2" },
        ],
      });
    }, 500); // Simulate network delay
  });
}

/**
 * Fetch detailed information for a specific device
 * Backend: Replace with GET /network/devices/:deviceId or similar
 */
export async function fetchDeviceDetails(
  deviceId: string
): Promise<DeviceDetails> {
  // TODO: Replace with: return fetch(`/api/network/devices/${deviceId}`).then(r => r.json())

  // Mock data for development
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: deviceId,
        name: `Device ${deviceId}`,
        type: "network-device",
        status: "online",
        ip: "192.168.1.100",
        lastSeen: "2 minutes ago",
        manufacturer: "Cisco Systems",
        uptime: "15 days, 3 hours",
        firmwareVersion: "v2.1.4",
        bandwidth: "1 Gbps",
        packetLoss: "0.1%",
      });
    }, 300);
  });
}

/**
 * Execute control action on a device (restart, configure, etc.)
 * Backend: Replace with POST /network/devices/:deviceId/action or similar
 */
export async function executeDeviceAction(
  deviceId: string,
  action: string
): Promise<{ success: boolean; message: string }> {
  // TODO: Replace with: return fetch(`/api/network/devices/${deviceId}/action`, { method: 'POST', body: JSON.stringify({ action }) }).then(r => r.json())

  // Mock response for development
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `${action} command sent to device ${deviceId}`,
      });
    }, 1000);
  });
}

/**
 * Subscribe to real-time device status updates
 * Backend: Replace with WebSocket connection or Server-Sent Events
 */
export function subscribeToNetworkUpdates(
  callback: (update: {
    deviceId: string;
    status: string;
    timestamp: string;
  }) => void
): () => void {
  // TODO: Replace with real WebSocket/SSE subscription
  // Example: const ws = new WebSocket('/api/network/updates')
  // ws.onmessage = (event) => callback(JSON.parse(event.data))

  // Mock periodic updates for development
  const interval = setInterval(() => {
    const devices = [
      "core",
      "web-server",
      "db-server",
      "wireless",
      "camera-1",
      "camera-2",
      "microphone-1",
    ];
    const statuses = ["online", "warning", "offline"];
    const randomDevice = devices[Math.floor(Math.random() * devices.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    callback({
      deviceId: randomDevice,
      status: randomStatus,
      timestamp: new Date().toISOString(),
    });
  }, 10000); // Update every 10 seconds

  // Return cleanup function
  return () => clearInterval(interval);
}
