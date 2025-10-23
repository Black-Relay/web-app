import React from "react";
import { type Node, Handle, Position } from "reactflow";
import {
  Router,
  Network,
  Server,
  Monitor,
  Laptop,
  Wifi,
  Shield,
} from "lucide-react";

export interface NetworkNodeData {
  label: string;
  type:
    | "gateway"
    | "switch"
    | "server"
    | "workstation"
    | "router"
    | "firewall"
    | "wireless";
  status: "online" | "warning" | "offline";
  ip: string;
  ports?: number;
  cpu?: string;
  user?: string;
  isCollapsed?: boolean;
  collapsedCount?: number;
  isSelected?: boolean;
}

// Custom node component that renders icons instead of text
const NetworkNodeComponentBase = ({ data }: { data: NetworkNodeData }) => {
  const getIcon = (type: string) => {
    const iconProps = { size: 24, className: "text-white" };
    switch (type) {
      case "gateway":
      case "router":
        return <Router {...iconProps} />;
      case "switch":
        return <Network {...iconProps} />;
      case "server":
        return <Server {...iconProps} />;
      case "workstation":
        return <Monitor {...iconProps} />;
      case "wireless":
        return <Wifi {...iconProps} />;
      case "firewall":
        return <Shield {...iconProps} />;
      default:
        return <Laptop {...iconProps} />;
    }
  };

  const getNodeStyles = (
    type: string,
    status: string,
    isSelected: boolean
  ): string => {
    const baseClasses =
      "flex items-center justify-center border-2 rounded-full w-12 h-12 relative transition-all duration-200";
    const selectedClasses = isSelected
      ? "border-yellow-400 border-4 shadow-lg shadow-yellow-400/50 scale-110"
      : "";

    let typeClasses = "";
    switch (type) {
      case "gateway":
      case "router":
        typeClasses = `bg-green-500 ${
          isSelected ? "border-yellow-400" : "border-green-700"
        }`;
        break;
      case "switch":
        typeClasses = `bg-blue-500 ${
          isSelected ? "border-yellow-400" : "border-blue-700"
        }`;
        break;
      case "server":
        typeClasses =
          status === "warning"
            ? `bg-red-600 ${
                isSelected ? "border-yellow-400" : "border-red-800"
              }`
            : `bg-orange-500 ${
                isSelected ? "border-yellow-400" : "border-orange-700"
              }`;
        break;
      case "workstation":
        typeClasses =
          status === "offline"
            ? `bg-gray-600 ${
                isSelected ? "border-yellow-400" : "border-gray-800"
              }`
            : `bg-purple-600 ${
                isSelected ? "border-yellow-400" : "border-purple-800"
              }`;
        break;
      case "wireless":
        typeClasses = `bg-cyan-500 ${
          isSelected ? "border-yellow-400" : "border-cyan-700"
        }`;
        break;
      case "firewall":
        typeClasses = `bg-red-500 ${
          isSelected ? "border-yellow-400" : "border-red-700"
        }`;
        break;
      default:
        typeClasses = `bg-gray-500 ${
          isSelected ? "border-yellow-400" : "border-gray-700"
        }`;
    }

    return `${baseClasses} ${typeClasses} ${selectedClasses}`;
  };

  return (
    <>
      {/* Hidden connection handles - lines go directly into nodes */}
      <Handle
        type="target"
        position={Position.Top}
        className="!opacity-0 !border-0 !w-1 !h-1"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0 !border-0 !w-1 !h-1"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!opacity-0 !border-0 !w-1 !h-1"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!opacity-0 !border-0 !w-1 !h-1"
      />

      <div
        className={getNodeStyles(
          data.type,
          data.status,
          data.isSelected || false
        )}
      >
        {getIcon(data.type)}
        {data.isCollapsed && data.collapsedCount && (
          <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {data.collapsedCount}
          </div>
        )}
        {/* Status indicator */}
        <div
          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
            data.status === "online"
              ? "bg-green-400"
              : data.status === "warning"
              ? "bg-yellow-400"
              : "bg-red-400"
          }`}
        />
      </div>
    </>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const NetworkNodeComponent = React.memo(NetworkNodeComponentBase);

export const createNetworkNode = (
  id: string,
  position: { x: number; y: number },
  data: NetworkNodeData
): Node => {
  return {
    id,
    position,
    data,
    type: "custom",
  };
};

// More graph-like network topology with interconnected nodes
export const networkNodes: Node[] = [
  // Core Infrastructure
  createNetworkNode(
    "internet",
    { x: 300, y: 50 },
    {
      label: "Internet Gateway",
      type: "gateway",
      status: "online",
      ip: "203.0.113.1",
    }
  ),

  createNetworkNode(
    "firewall",
    { x: 300, y: 150 },
    {
      label: "Firewall",
      type: "firewall",
      status: "online",
      ip: "192.168.1.1",
    }
  ),

  createNetworkNode(
    "core-switch",
    { x: 300, y: 250 },
    {
      label: "Core Switch",
      type: "switch",
      status: "online",
      ip: "192.168.1.10",
      ports: 48,
    }
  ),

  // Distribution Layer
  createNetworkNode(
    "switch-left",
    { x: 150, y: 350 },
    {
      label: "Distribution Switch A",
      type: "switch",
      status: "online",
      ip: "192.168.1.11",
      ports: 24,
    }
  ),

  createNetworkNode(
    "switch-right",
    { x: 450, y: 350 },
    {
      label: "Distribution Switch B",
      type: "switch",
      status: "online",
      ip: "192.168.1.12",
      ports: 24,
    }
  ),

  // Servers (with redundancy)
  createNetworkNode(
    "web-server-1",
    { x: 100, y: 450 },
    {
      label: "Web Server Primary",
      type: "server",
      status: "online",
      ip: "192.168.1.100",
      cpu: "75%",
    }
  ),

  createNetworkNode(
    "web-server-2",
    { x: 200, y: 450 },
    {
      label: "Web Server Secondary",
      type: "server",
      status: "online",
      ip: "192.168.1.101",
      cpu: "45%",
    }
  ),

  createNetworkNode(
    "db-server",
    { x: 300, y: 450 },
    {
      label: "Database Server",
      type: "server",
      status: "warning",
      ip: "192.168.1.110",
      cpu: "95%",
    }
  ),

  createNetworkNode(
    "backup-server",
    { x: 400, y: 450 },
    {
      label: "Backup Server",
      type: "server",
      status: "online",
      ip: "192.168.1.120",
      cpu: "25%",
    }
  ),

  // Wireless and Access Points
  createNetworkNode(
    "wireless-controller",
    { x: 500, y: 450 },
    {
      label: "Wireless Controller",
      type: "wireless",
      status: "online",
      ip: "192.168.1.200",
    }
  ),

  // Collapsed workstation chain
  createNetworkNode(
    "workstation-cluster",
    { x: 75, y: 550 },
    {
      label: "Workstation Cluster",
      type: "workstation",
      status: "online",
      ip: "192.168.1.50-59",
      isCollapsed: true,
      collapsedCount: 8,
      user: "multiple users",
    }
  ),

  // Individual critical workstations
  createNetworkNode(
    "admin-workstation",
    { x: 225, y: 550 },
    {
      label: "Admin Workstation",
      type: "workstation",
      status: "online",
      ip: "192.168.1.60",
      user: "admin",
    }
  ),

  createNetworkNode(
    "dev-workstation",
    { x: 375, y: 550 },
    {
      label: "Development Workstation",
      type: "workstation",
      status: "offline",
      ip: "192.168.1.70",
      user: "developer",
    }
  ),

  // External monitoring
  createNetworkNode(
    "monitoring",
    { x: 525, y: 550 },
    {
      label: "Monitoring Server",
      type: "server",
      status: "online",
      ip: "192.168.1.130",
      cpu: "60%",
    }
  ),
];
