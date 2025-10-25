import { useCallback, useMemo, useEffect } from "react";
import ReactFlow, {
  Background,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from "reactflow";
import SimpleNetworkNode, { type SimpleNodeData } from "./SimpleNetworkNode";

import {
  Tooltip,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { X, Check } from "lucide-react";

import "reactflow/dist/style.css";
import "../css/reactflow.css";

// Define fitView options outside component to avoid recreation
const fitViewOptions = { padding: 0.1 };

// Clean radial network layout like the reference image
// Extensible network topology framework
interface NetworkDevice {
  id: string;
  label: string;
  type: SimpleNodeData["type"];
  status: SimpleNodeData["status"];
  ip: string;
  parent?: string;
  children?: string[];
}

interface NetworkTopology {
  devices: NetworkDevice[];
  connections: Array<{
    from: string;
    to: string;
    style?: any;
  }>;
}

// Grid-based greedy positioning system
interface GridPosition {
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  occupied: boolean;
  reservedFor?: string; // Device ID that reserved this space
}

class GridLayoutManager {
  private occupiedPositions: Set<string> = new Set();
  private reservedPositions: Map<string, string> = new Map();
  private gridSize: number = 100; // Fixed step size between grid positions
  private centerX: number;
  private centerY: number;

  constructor(centerX: number, centerY: number) {
    this.centerX = centerX;
    this.centerY = centerY;
  }

  private getGridKey(gridX: number, gridY: number): string {
    return `${gridX},${gridY}`;
  }

  private getPosition(gridX: number, gridY: number): GridPosition {
    return {
      x: this.centerX + gridX * this.gridSize,
      y: this.centerY + gridY * this.gridSize,
      gridX,
      gridY,
      occupied: this.occupiedPositions.has(this.getGridKey(gridX, gridY)),
      reservedFor: this.reservedPositions.get(this.getGridKey(gridX, gridY)),
    };
  }

  // Get available adjacent positions prioritizing clear line of sight
  private getAdjacentPositions(
    gridX: number,
    gridY: number,
    childIndex: number = 0
  ): Array<{ gridX: number; gridY: number }> {
    const positions = [
      { gridX: gridX - 1, gridY: gridY }, // left
      { gridX: gridX + 1, gridY: gridY }, // right
      { gridX: gridX, gridY: gridY - 1 }, // up
      { gridX: gridX, gridY: gridY + 1 }, // down
      { gridX: gridX - 1, gridY: gridY - 1 }, // up-left
      { gridX: gridX + 1, gridY: gridY - 1 }, // up-right
      { gridX: gridX - 1, gridY: gridY + 1 }, // down-left
      { gridX: gridX + 1, gridY: gridY + 1 }, // down-right
    ];

    // Sort positions by likelihood of having clear line of sight
    // Prioritize positions that are less likely to intersect with existing nodes
    return positions.sort((a, b) => {
      // Prefer positions further from the center where there are typically fewer nodes
      const distanceA = Math.abs(a.gridX) + Math.abs(a.gridY);
      const distanceB = Math.abs(b.gridX) + Math.abs(b.gridY);

      // Secondary sort by child index for balance
      if (distanceA === distanceB) {
        const preferLeft = childIndex % 2 === 0;
        if (preferLeft) {
          return a.gridX - b.gridX; // Left first
        } else {
          return b.gridX - a.gridX; // Right first
        }
      }

      return distanceB - distanceA; // Prefer positions further from center
    });
  }

  placeDevice(
    parentGridX: number,
    parentGridY: number,
    deviceId: string,
    childIndex: number = 0
  ): GridPosition | null {
    const adjacentPositions = this.getAdjacentPositions(
      parentGridX,
      parentGridY,
      childIndex
    );

    // Try adjacent positions first (most common case)
    for (const pos of adjacentPositions) {
      const key = this.getGridKey(pos.gridX, pos.gridY);

      if (
        !this.occupiedPositions.has(key) &&
        !this.reservedPositions.has(key)
      ) {
        // Check if line from parent to this position would intersect other nodes
        if (
          !this.wouldLineIntersectNodes(
            parentGridX,
            parentGridY,
            pos.gridX,
            pos.gridY
          )
        ) {
          // Occupy this position
          this.occupiedPositions.add(key);
          this.reservedPositions.set(key, deviceId);
          return this.getPosition(pos.gridX, pos.gridY);
        }
      }
    }

    // If no adjacent spots, try expanding search with larger radius to find clear paths
    for (let radius = 2; radius <= 5; radius++) {
      const positions = this.getPositionsAtRadius(
        parentGridX,
        parentGridY,
        radius
      );
      for (const pos of positions) {
        const key = this.getGridKey(pos.gridX, pos.gridY);

        if (
          !this.occupiedPositions.has(key) &&
          !this.reservedPositions.has(key)
        ) {
          // Check if line from parent to this position would intersect other nodes
          if (
            !this.wouldLineIntersectNodes(
              parentGridX,
              parentGridY,
              pos.gridX,
              pos.gridY
            )
          ) {
            this.occupiedPositions.add(key);
            this.reservedPositions.set(key, deviceId);
            return this.getPosition(pos.gridX, pos.gridY);
          }
        }
      }
    }

    // Last resort: place without intersection checking if no clean path found
    // This prevents devices from not being placed at all
    for (let radius = 2; radius <= 5; radius++) {
      const positions = this.getPositionsAtRadius(
        parentGridX,
        parentGridY,
        radius
      );
      for (const pos of positions) {
        const key = this.getGridKey(pos.gridX, pos.gridY);

        if (
          !this.occupiedPositions.has(key) &&
          !this.reservedPositions.has(key)
        ) {
          this.occupiedPositions.add(key);
          this.reservedPositions.set(key, deviceId);
          console.warn(
            `Placed ${deviceId} at intersecting position as fallback`
          );
          return this.getPosition(pos.gridX, pos.gridY);
        }
      }
    }

    return null; // No space found
  }

  private wouldLineIntersectNodes(
    parentGridX: number,
    parentGridY: number,
    childGridX: number,
    childGridY: number
  ): boolean {
    // Convert grid coordinates to actual pixel positions
    const parentX = this.centerX + parentGridX * this.gridSize;
    const parentY = this.centerY + parentGridY * this.gridSize;
    const childX = this.centerX + childGridX * this.gridSize;
    const childY = this.centerY + childGridY * this.gridSize;

    const nodeRadius = 35; // Increased radius to provide more clearance around nodes

    // Check if line intersects with any existing nodes
    for (const positionKey of this.occupiedPositions) {
      const [gridXStr, gridYStr] = positionKey.split(",");
      const nodeGridX = parseInt(gridXStr);
      const nodeGridY = parseInt(gridYStr);

      // Skip parent and child positions
      if (
        (nodeGridX === parentGridX && nodeGridY === parentGridY) ||
        (nodeGridX === childGridX && nodeGridY === childGridY)
      ) {
        continue;
      }

      const nodeX = this.centerX + nodeGridX * this.gridSize;
      const nodeY = this.centerY + nodeGridY * this.gridSize;

      // Check if line intersects with this node's circle
      if (
        this.lineIntersectsCircle(
          parentX,
          parentY,
          childX,
          childY,
          nodeX,
          nodeY,
          nodeRadius
        )
      ) {
        return true;
      }
    }

    return false;
  }

  private lineIntersectsCircle(
    x1: number,
    y1: number, // Line start
    x2: number,
    y2: number, // Line end
    cx: number,
    cy: number, // Circle center
    r: number // Circle radius
  ): boolean {
    // Vector from line start to circle center
    const dx = cx - x1;
    const dy = cy - y1;

    // Line direction vector
    const lineX = x2 - x1;
    const lineY = y2 - y1;

    // Length of line segment
    const lineLength = Math.sqrt(lineX * lineX + lineY * lineY);
    if (lineLength === 0) return false;

    // Normalized line direction
    const unitX = lineX / lineLength;
    const unitY = lineY / lineLength;

    // Project circle center onto line
    const projection = dx * unitX + dy * unitY;

    // Clamp projection to line segment
    const clampedProjection = Math.max(0, Math.min(lineLength, projection));

    // Find closest point on line segment to circle center
    const closestX = x1 + unitX * clampedProjection;
    const closestY = y1 + unitY * clampedProjection;

    // Distance from circle center to closest point on line
    const distanceX = cx - closestX;
    const distanceY = cy - closestY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    // Check if distance is less than circle radius
    return distance < r;
  }

  private getPositionsAtRadius(
    centerX: number,
    centerY: number,
    radius: number
  ): Array<{ gridX: number; gridY: number }> {
    const positions: Array<{ gridX: number; gridY: number }> = [];

    // Only check perimeter positions for efficiency
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
          positions.push({ gridX: centerX + dx, gridY: centerY + dy });
        }
      }
    }

    return positions;
  }

  reserveSpaceForChildren(
    parentGridX: number,
    parentGridY: number,
    childrenCount: number,
    parentId: string
  ): void {
    const adjacentPositions = this.getAdjacentPositions(
      parentGridX,
      parentGridY
    );
    let reserved = 0;

    for (const pos of adjacentPositions) {
      if (reserved >= childrenCount) break;

      const key = this.getGridKey(pos.gridX, pos.gridY);

      if (
        !this.occupiedPositions.has(key) &&
        !this.reservedPositions.has(key)
      ) {
        this.reservedPositions.set(key, `${parentId}-child`);
        reserved++;
      }
    }
  }
}

// Define network topology
const networkTopology: NetworkTopology = {
  devices: [
    // Core infrastructure
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
      id: "switch-1",
      label: "Switch 1",
      type: "switch",
      status: "online",
      ip: "192.168.1.10",
      parent: "core",
    },
    {
      id: "firewall",
      label: "Firewall",
      type: "firewall",
      status: "online",
      ip: "192.168.1.2",
      parent: "core",
    },
    {
      id: "wireless",
      label: "Wireless",
      type: "wireless",
      status: "warning",
      ip: "192.168.1.20",
      parent: "core",
    },
    {
      id: "switch-2",
      label: "Switch 2",
      type: "switch",
      status: "offline",
      ip: "192.168.1.11",
      parent: "core",
    },

    // First ring sensors
    {
      id: "camera-1",
      label: "Security Camera 1",
      type: "camera",
      status: "online",
      ip: "192.168.1.150",
      parent: "switch-1",
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
      id: "camera-3",
      label: "Entrance Camera",
      type: "camera",
      status: "online",
      ip: "192.168.1.152",
      parent: "switch-2",
    },
    {
      id: "microphone-1",
      label: "Audio Sensor 1",
      type: "microphone",
      status: "online",
      ip: "192.168.1.160",
      parent: "firewall",
    },
    {
      id: "microphone-2",
      label: "Audio Sensor 2",
      type: "microphone",
      status: "offline",
      ip: "192.168.1.161",
      parent: "switch-2",
    },
    {
      id: "microphone-3",
      label: "Perimeter Mic",
      type: "microphone",
      status: "online",
      ip: "192.168.1.162",
      parent: "switch-1",
    },

    // Second ring infrastructure
    {
      id: "server-2",
      label: "Backup Server",
      type: "server",
      status: "online",
      ip: "192.168.1.102",
      parent: "core",
    },
    {
      id: "wireless-2",
      label: "Guest WiFi",
      type: "wireless",
      status: "online",
      ip: "192.168.1.21",
      parent: "switch-1",
    },
    {
      id: "wireless-3",
      label: "IoT Network",
      type: "wireless",
      status: "warning",
      ip: "192.168.1.22",
      parent: "switch-2",
    },
    {
      id: "firewall-2",
      label: "DMZ Firewall",
      type: "firewall",
      status: "online",
      ip: "192.168.1.3",
      parent: "core",
    },

    // Second ring sensors
    {
      id: "camera-4",
      label: "Parking Camera",
      type: "camera",
      status: "online",
      ip: "192.168.1.153",
      parent: "wireless-2",
    },
    {
      id: "camera-5",
      label: "Roof Camera",
      type: "camera",
      status: "warning",
      ip: "192.168.1.154",
      parent: "web-server",
    },
    {
      id: "microphone-4",
      label: "Main Entrance Mic",
      type: "microphone",
      status: "online",
      ip: "192.168.1.163",
      parent: "firewall-2",
    },
    {
      id: "microphone-5",
      label: "Emergency Mic",
      type: "microphone",
      status: "offline",
      ip: "192.168.1.164",
      parent: "wireless-3",
    },

    // Third ring sensors
    {
      id: "camera-6",
      label: "Side Gate Camera",
      type: "camera",
      status: "online",
      ip: "192.168.1.155",
      parent: "wireless-2",
    },
    {
      id: "microphone-6",
      label: "Back Yard Mic",
      type: "microphone",
      status: "online",
      ip: "192.168.1.165",
      parent: "wireless-3",
    },
  ],
  connections: [],
};

const createRadialLayout = () => {
  const centerX = 400;
  const centerY = 300;
  // Build parent-child relationships
  const deviceMap = new Map(
    networkTopology.devices.map((d: NetworkDevice) => [d.id, d])
  );
  const childrenMap = new Map<string, NetworkDevice[]>();

  networkTopology.devices.forEach((device: NetworkDevice) => {
    if (device.parent) {
      if (!childrenMap.has(device.parent)) {
        childrenMap.set(device.parent, []);
      }
      childrenMap.get(device.parent)!.push(device);
    }
  });

  const positionedDevices: Array<
    NetworkDevice & { x: number; y: number; gridX: number; gridY: number }
  > = [];
  const gridManager = new GridLayoutManager(centerX, centerY);

  // Greedy grid-based positioning with batch processing for siblings
  const queue: Array<{
    parentDevice: NetworkDevice & {
      x: number;
      y: number;
      gridX: number;
      gridY: number;
    };
    children: NetworkDevice[];
  }> = [];

  // Start with core device at center (0,0) grid position
  const coreDevice = deviceMap.get("core")!;
  const coreGrid = gridManager.placeDevice(0, 0, coreDevice.id);
  if (coreGrid) {
    const corePositioned = {
      ...coreDevice,
      x: coreGrid.x,
      y: coreGrid.y,
      gridX: coreGrid.gridX,
      gridY: coreGrid.gridY,
    };
    positionedDevices.push(corePositioned);

    // Add core's children as a batch to process together
    const coreChildren = childrenMap.get(coreDevice.id) || [];
    if (coreChildren.length > 0) {
      gridManager.reserveSpaceForChildren(
        0,
        0,
        coreChildren.length,
        coreDevice.id
      );
      queue.push({
        parentDevice: corePositioned,
        children: coreChildren,
      });
    }
  }

  // Process queue in batches - all siblings processed together
  while (queue.length > 0) {
    const { parentDevice, children } = queue.shift()!;

    // Process all children of this parent together
    const newlyPositioned: Array<
      NetworkDevice & { x: number; y: number; gridX: number; gridY: number }
    > = [];

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const gridPos = gridManager.placeDevice(
        parentDevice.gridX,
        parentDevice.gridY,
        child.id,
        i
      );
      if (gridPos) {
        const positionedDevice = {
          ...child,
          x: gridPos.x,
          y: gridPos.y,
          gridX: gridPos.gridX,
          gridY: gridPos.gridY,
        };
        positionedDevices.push(positionedDevice);
        newlyPositioned.push(positionedDevice);
      }
    }

    // Now add each newly positioned device's children to the queue as separate batches
    for (const positioned of newlyPositioned) {
      const grandChildren = childrenMap.get(positioned.id) || [];
      if (grandChildren.length > 0) {
        gridManager.reserveSpaceForChildren(
          positioned.gridX,
          positioned.gridY,
          grandChildren.length,
          positioned.id
        );
        queue.push({
          parentDevice: positioned,
          children: grandChildren,
        });
      }
    }
  }

  const nodes = positionedDevices;

  return nodes.map((node) => ({
    id: node.id,
    position: { x: node.x, y: node.y },
    data: {
      type: node.type,
      status: node.status,
      ip: node.ip,
      deviceLabel: node.label,
    },
    type: "simple",
  }));
};

const radialNetworkNodes = createRadialLayout();

// Auto-generate edges based on parent-child relationships
const generateEdges = (topologyData: NetworkTopology): Edge[] => {
  const edges: Edge[] = [];

  // Style configuration for different device types
  const getEdgeStyle = (deviceType: SimpleNodeData["type"], level: number) => {
    const baseStyles: Record<
      SimpleNodeData["type"],
      { stroke: string; strokeWidth: number }
    > = {
      camera: { stroke: "#6366f1", strokeWidth: 1.5 },
      microphone: { stroke: "#ec4899", strokeWidth: 1.5 },
      server: { stroke: "#95a5a6", strokeWidth: 2 },
      switch: { stroke: "#95a5a6", strokeWidth: 2 },
      firewall: { stroke: "#dc2626", strokeWidth: 2 },
      wireless: { stroke: "#9333ea", strokeWidth: 1.8 },
      router: { stroke: "#95a5a6", strokeWidth: 2 },
      workstation: { stroke: "#95a5a6", strokeWidth: 1.5 },
    };

    const style = baseStyles[deviceType];
    // Reduce stroke width for deeper levels
    return {
      ...style,
      strokeWidth: Math.max(style.strokeWidth - level * 0.3, 0.8),
    };
  };

  // Helper to determine device hierarchy level
  const getDeviceLevel = (
    deviceId: string,
    devices: NetworkDevice[]
  ): number => {
    const device = devices.find((d: NetworkDevice) => d.id === deviceId);
    if (!device?.parent || device.parent === "core") return 1;
    return 1 + getDeviceLevel(device.parent, devices);
  };

  topologyData.devices.forEach((device: NetworkDevice) => {
    if (device.parent) {
      const level = getDeviceLevel(device.id, topologyData.devices);

      edges.push({
        id: `${device.parent}-${device.id}`,
        source: device.parent,
        sourceHandle: "center",
        target: device.id,
        targetHandle: "center-target",
        type: "straight",
        style: getEdgeStyle(device.type, level),
      });
    }
  });

  return edges;
};

const radialEdges: Edge[] = generateEdges(networkTopology);

interface NetworkMapProps {
  onNodeSelect?: (node: Node<SimpleNodeData> | null) => void;
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

function NetworkMapFlow({ onNodeSelect }: NetworkMapProps) {
  const { fitView } = useReactFlow();
  const nodeTypes = useMemo(() => ({ simple: SimpleNetworkNode }), []);

  const [nodes, setNodes, onNodesChange] = useNodesState(radialNetworkNodes);
  const [edges, , onEdgesChange] = useEdgesState(radialEdges);

  // Calculate device statistics
  const deviceStats = useMemo(() => {
    const total = nodes.length;
    const onlineNodes = nodes.filter((node) => node.data.status === "online");
    const warningNodes = nodes.filter((node) => node.data.status === "warning");
    const offlineNodes = nodes.filter((node) => node.data.status === "offline");

    return {
      total,
      online: onlineNodes.length,
      warning: warningNodes.length,
      offline: offlineNodes.length,
      onlineNodes,
      warningNodes,
      offlineNodes,
    };
  }, [nodes]);

  // Handle window resize to update the flow layout
  useEffect(() => {
    const handleResize = () => {
      // Small delay to ensure container has updated size
      setTimeout(() => {
        fitView(fitViewOptions);
      }, 10);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fitView]);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      // Update selected node styling by modifying node data
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: {
            ...n.data,
            isSelected: n.id === node.id,
          },
        }))
      );

      onNodeSelect?.(node);
    },
    [setNodes, onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    // Deselect node when clicking on empty space
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isSelected: false,
        },
      }))
    );
    onNodeSelect?.(null);
  }, [setNodes, onNodeSelect]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          panOnDrag={false}
          fitView
          fitViewOptions={fitViewOptions}
          className="cursor-default"
        >
          <Background />
        </ReactFlow>
      </div>

      {/* Device Summary */}
      <div className="mt-4 p-3 bg-muted border border-border rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="font-medium text-muted-foreground">
              Total Devices:{" "}
              <span className="font-bold text-foreground">
                {deviceStats.total}
              </span>
            </span>
            <div className="flex items-center space-x-1">
              <div className="w-5 h-5 bg-green-500 border-2 border-background/80 rounded-full flex items-center justify-center">
                <Check
                  size={10}
                  className="stroke-background"
                  strokeWidth={3}
                />
              </div>
              <span className="text-green-700 dark:text-green-400">
                Online: {deviceStats.online}
              </span>
            </div>

            {deviceStats.warning > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1 cursor-help">
                    <div className="w-5 h-5 bg-yellow-500 border-2 border-background/80 rounded-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
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
                    <span className="text-yellow-700 dark:text-yellow-400">
                      Warning: {deviceStats.warning}
                    </span>
                  </div>
                </TooltipTrigger>
                <CustomTooltipContent className="max-w-xs" sideOffset={5}>
                  <div className="space-y-1">
                    <div className="font-medium text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                      Warning Devices:
                    </div>
                    <div className="max-h-32 overflow-y-auto">
                      {deviceStats.warningNodes.map((node) => (
                        <div
                          key={node.id}
                          className="text-xs pl-4 py-0.5 hover:bg-muted/50 cursor-pointer rounded"
                          onClick={() => {
                            // Select the node in the main diagram
                            setNodes((nds) =>
                              nds.map((n) => ({
                                ...n,
                                data: {
                                  ...n.data,
                                  isSelected: n.id === node.id,
                                },
                              }))
                            );
                            // Trigger the node selection callback
                            onNodeSelect?.(node);
                          }}
                        >
                          {node.data.deviceLabel} ({node.data.ip})
                        </div>
                      ))}
                    </div>
                  </div>
                </CustomTooltipContent>
              </Tooltip>
            )}

            {deviceStats.offline > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1 cursor-help">
                    <div className="w-5 h-5 bg-red-500 border-2 border-background/80 rounded-full flex items-center justify-center">
                      <X
                        size={10}
                        className="stroke-background"
                        strokeWidth={3}
                      />
                    </div>
                    <span className="text-red-700 dark:text-red-400">
                      Offline: {deviceStats.offline}
                    </span>
                  </div>
                </TooltipTrigger>
                <CustomTooltipContent className="max-w-xs" sideOffset={5}>
                  <div className="space-y-1">
                    <div className="font-medium text-red-700 dark:text-red-400 flex items-center gap-1">
                      Offline Devices:
                    </div>
                    <div className="max-h-32 overflow-y-auto">
                      {deviceStats.offlineNodes.map((node) => (
                        <div
                          key={node.id}
                          className="text-xs pl-4 py-0.5 hover:bg-muted/50 cursor-pointer rounded"
                          onClick={() => {
                            // Select the node in the main diagram
                            setNodes((nds) =>
                              nds.map((n) => ({
                                ...n,
                                data: {
                                  ...n.data,
                                  isSelected: n.id === node.id,
                                },
                              }))
                            );
                            // Trigger the node selection callback
                            onNodeSelect?.(node);
                          }}
                        >
                          {node.data.deviceLabel} ({node.data.ip})
                        </div>
                      ))}
                    </div>
                  </div>
                </CustomTooltipContent>
              </Tooltip>
            )}

            {deviceStats.warning === 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-5 h-5 bg-yellow-500 border-2 border-background/80 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
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
                <span className="text-yellow-700 dark:text-yellow-400">
                  Warning: {deviceStats.warning}
                </span>
              </div>
            )}

            {deviceStats.offline === 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-5 h-5 bg-red-500 border-2 border-background/80 rounded-full flex items-center justify-center">
                  <X size={10} className="stroke-background" strokeWidth={3} />
                </div>
                <span className="text-red-700 dark:text-red-400">
                  Offline: {deviceStats.offline}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NetworkMap({ onNodeSelect }: NetworkMapProps) {
  return (
    <ReactFlowProvider>
      <TooltipProvider>
        <NetworkMapFlow onNodeSelect={onNodeSelect} />
      </TooltipProvider>
    </ReactFlowProvider>
  );
}
