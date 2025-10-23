import { type Node } from "reactflow";
import { type NetworkNodeData } from "./NetworkNode";
import { Button } from "@/components/ui/button";
import {
  Power,
  RotateCcw,
  Settings,
  Eye,
  EyeOff,
  Volume2,
  Camera,
  Wifi,
  Activity,
  Shield,
} from "lucide-react";

interface SelectedNodePanelProps {
  node: Node<NetworkNodeData>;
}

export function SelectedNodePanel({ node }: SelectedNodePanelProps) {
  return (
    <div className="bg-card border border-border p-4 rounded-lg text-sm shadow-sm">
      <div className="font-bold mb-2 text-lg">Device Details</div>
      <div className="space-y-2">
        <div>
          <span className="font-medium">Name:</span> {node.data.label}
        </div>
        <div>
          <span className="font-medium">ID:</span> {node.id}
        </div>
        <div>
          <span className="font-medium">Type:</span> {node.data.type}
        </div>
        <div>
          <span className="font-medium">Status:</span>
          <span
            className={`ml-2 px-2 py-1 rounded-full text-xs ${
              node.data.status === "online"
                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
            }`}
          >
            {node.data.status}
          </span>
        </div>
        <div>
          <span className="font-medium">IP:</span> {node.data.ip}
        </div>
        {node.data.ports && (
          <div>
            <span className="font-medium">Ports:</span> {node.data.ports}
          </div>
        )}
        {node.data.cpu && (
          <div>
            <span className="font-medium">CPU Usage:</span> {node.data.cpu}
          </div>
        )}
        {node.data.user && (
          <div>
            <span className="font-medium">User:</span> {node.data.user}
          </div>
        )}
      </div>

      {/* Device Actions */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="font-medium mb-3">Device Controls</div>
        <div className="space-y-2">
          {/* Primary Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => console.log("Restart device:", node.id)}
            >
              <RotateCcw size={14} />
              Restart
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex items-center gap-1"
              onClick={() => console.log("Emergency shutdown:", node.id)}
            >
              <Power size={14} />
              Kill Switch
            </Button>
          </div>

          {/* Device-specific Actions */}
          {(node.data.type === "server" ||
            node.data.type === "workstation") && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => console.log("View system status:", node.id)}
              >
                <Activity size={14} />
                System Status
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => console.log("Configure device:", node.id)}
              >
                <Settings size={14} />
                Configure
              </Button>
            </div>
          )}

          {node.data.type === "wireless" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => console.log("Toggle camera:", node.id)}
              >
                <Camera size={14} />
                Enable Camera
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => console.log("Toggle audio:", node.id)}
              >
                <Volume2 size={14} />
                Enable Audio
              </Button>
            </div>
          )}

          {node.data.type === "firewall" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => console.log("Security scan:", node.id)}
              >
                <Shield size={14} />
                Security Scan
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => console.log("Block traffic:", node.id)}
              >
                <EyeOff size={14} />
                Block Traffic
              </Button>
            </div>
          )}

          {(node.data.type === "switch" || node.data.type === "router") && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => console.log("View network traffic:", node.id)}
              >
                <Eye size={14} />
                Monitor Traffic
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => console.log("Reset network:", node.id)}
              >
                <Wifi size={14} />
                Reset Network
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
