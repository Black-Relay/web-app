import { Handle, Position } from "reactflow";
import {
  Router,
  Network,
  Server,
  Monitor,
  Wifi,
  Shield,
  Check,
  X,
  AlertTriangle,
  Camera,
  Mic,
} from "lucide-react";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export interface SimpleNodeData {
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
  deviceLabel: string;
}

// Custom tooltip content with white arrow
function CustomTooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "bg-background text-foreground border border-border shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 rounded-md px-3 py-1.5 text-xs",
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

const SimpleNetworkNode = ({ data }: { data: SimpleNodeData }) => {
  const getIcon = () => {
    const iconProps = { size: 24, className: "text-white", strokeWidth: 2.5 };
    switch (data.type) {
      case "switch":
        return <Network {...iconProps} />;
      case "server":
        return <Server {...iconProps} />;
      case "firewall":
        return <Shield {...iconProps} />;
      case "wireless":
        return <Wifi {...iconProps} />;
      case "router":
        return <Router {...iconProps} />;
      case "workstation":
        return <Monitor {...iconProps} />;
      case "camera":
        return <Camera {...iconProps} />;
      case "microphone":
        return <Mic {...iconProps} />;
      default:
        return <Network {...iconProps} />;
    }
  };

  const getStatusIndicator = () => {
    switch (data.status) {
      case "online":
        return (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-green-500 border-4 border-background/80 rounded-full flex items-center justify-center drop-shadow-sm z-20">
            <Check size={10} className="stroke-background" strokeWidth={3} />
          </div>
        );
      case "warning":
        return (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-yellow-500 border-4 border-background/80 rounded-full flex items-center justify-center drop-shadow-sm z-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-circle-alert-icon lucide-circle-alert stroke-background"
            >
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
          </div>
        );
      case "offline":
        return (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-red-500 border-4 border-background/80 rounded-full flex items-center justify-center drop-shadow-sm z-20">
            <X size={10} className="stroke-background" strokeWidth={3} />
          </div>
        );
      default:
        return null;
    }
  };

  const getNodeColor = () => {
    switch (data.type) {
      case "switch":
        return "bg-blue-500";
      case "server":
        return data.status === "warning" ? "bg-orange-500" : "bg-green-500";
      case "firewall":
        return "bg-red-500";
      case "wireless":
        return "bg-purple-500";
      case "router":
        return "bg-red-600";
      case "camera":
        return "bg-indigo-500";
      case "microphone":
        return "bg-pink-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPulseGlow = () => {
    switch (data.status) {
      case "warning":
        return (
          <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-90 scale-70"></div>
        );
      case "offline":
        return (
          <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-90 scale-70"></div>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-red-600";
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          {/* Single invisible handle at center for all connections */}
          <Handle
            type="source"
            position={Position.Top}
            id="center"
            className="!opacity-0 !w-0 !h-0 !border-0 !bg-transparent !outline-0 !cursor-pointer"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              position: "absolute",
              zIndex: 1,
              cursor: "pointer",
              pointerEvents: "none",
            }}
          />
          <Handle
            type="target"
            position={Position.Top}
            id="center-target"
            className="!opacity-0 !w-0 !h-0 !border-0 !bg-transparent !outline-0 !cursor-pointer"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              position: "absolute",
              zIndex: 1,
              cursor: "pointer",
              pointerEvents: "none",
            }}
          />

          <div className="relative hover:scale-110 transition-transform z-10 cursor-pointer">
            {/* Transparent pulse glow behind entire node */}
            {getPulseGlow()}

            <div
              className={`
              ${getNodeColor()}
              rounded-full
              w-14 h-14
              flex items-center justify-center
              shadow-lg
              relative z-10 border-4 border-background/80
            `}
            >
              {getIcon()}
            </div>
            {getStatusIndicator()}
          </div>
        </div>
      </TooltipTrigger>
      <CustomTooltipContent sideOffset={5}>
        <div className="space-y-1">
          <div className="font-medium">{data.deviceLabel}</div>
          <div className="text-xs text-muted-foreground">Type: {data.type}</div>
          <div className="text-xs">
            Status:{" "}
            <span className={getStatusColor(data.status)}>{data.status}</span>
          </div>
          <div className="text-xs text-muted-foreground">IP: {data.ip}</div>
        </div>
      </CustomTooltipContent>
    </Tooltip>
  );
};

export default SimpleNetworkNode;
