// Network device sidebar component
// Backend dev: You can enhance this by calling fetchDeviceDetails(selectedNode.id)
// when a device is selected to show more detailed information

import type { Node } from "reactflow";
import type { SimpleNodeData } from "./SimpleNetworkNode";
import {
  Router,
  Wifi,
  Monitor,
  Server,
  Shield,
  Network,
  Camera,
  Mic,
  Power,
  RotateCcw,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { executeDeviceAction } from "@/services/networkService";

interface NetworkAside {
  selectedNode: Node<SimpleNodeData> | null;
}

export function NetworkAside({ selectedNode }: NetworkAside) {
  const handleDeviceAction = async (action: string) => {
    if (!selectedNode) return;

    try {
      const result = await executeDeviceAction(selectedNode.id, action);
      if (result.success) {
        // You could add a toast notification here
        console.log("Action successful:", result.message);
      }
    } catch (error) {
      console.error("Device action failed:", error);
    }
  };

  if (!selectedNode) {
    return (
      <div className="p-4">
        <div className="text-center text-muted-foreground">
          <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Select a device to view details</p>
        </div>
      </div>
    );
  }

  const { data } = selectedNode;

  const getDeviceIcon = () => {
    switch (data.type) {
      case "router":
        return <Router className="w-6 h-6" />;
      case "wireless":
        return <Wifi className="w-6 h-6" />;
      case "workstation":
        return <Monitor className="w-6 h-6" />;
      case "server":
        return <Server className="w-6 h-6" />;
      case "switch":
        return <Network className="w-6 h-6" />;
      case "firewall":
        return <Shield className="w-6 h-6" />;
      case "camera":
        return <Camera className="w-6 h-6" />;
      case "microphone":
        return <Mic className="w-6 h-6" />;
      default:
        return <Monitor className="w-6 h-6" />;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case "online":
        return "text-green-500";
      case "offline":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="p-4">
      {/* Device Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`${getStatusColor()}`}>{getDeviceIcon()}</div>
        <div>
          <h3 className="font-semibold">{data.deviceLabel}</h3>
          <p className="text-sm text-muted-foreground capitalize">
            {data.type?.replace("-", " ")}
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <div
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            data.status === "online"
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : data.status === "offline"
              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full mr-1 ${
              data.status === "online"
                ? "bg-green-500"
                : data.status === "offline"
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
          />
          {data.status}
        </div>
      </div>

      {/* Device Details */}
      <div className="space-y-3 mb-6">
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            IP Address
          </label>
          <p className="text-sm font-mono">{data.ip || "192.168.1.1"}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Device ID
          </label>
          <p className="text-sm font-mono">{selectedNode.id}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Last Seen
          </label>
          <p className="text-sm">2 minutes ago</p>
        </div>

        {data.type === "router" && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Connected Devices
            </label>
            <p className="text-sm">8 devices</p>
          </div>
        )}

        {(data.type === "camera" || data.type === "microphone") && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Recording
            </label>
            <p className="text-sm">
              {data.status === "online" ? "Active" : "Inactive"}
            </p>
          </div>
        )}
      </div>

      {/* Control Actions */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">
          Device Controls
        </h4>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          disabled={data.status === "offline"}
          onClick={() => handleDeviceAction("restart")}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restart Device
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          disabled={data.status === "offline"}
          onClick={() => handleDeviceAction("configure")}
        >
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </Button>

        <Button
          variant="destructive"
          size="sm"
          className="w-full justify-start"
          disabled={data.status === "offline"}
          onClick={() =>
            handleDeviceAction(
              data.status === "online" ? "disconnect" : "connect"
            )
          }
        >
          <Power className="w-4 h-4 mr-2" />
          {data.status === "online" ? "Disconnect" : "Connect"}
        </Button>
      </div>
    </div>
  );
}
