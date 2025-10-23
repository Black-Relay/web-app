import { type Node } from "reactflow";
import { type NetworkNodeData } from "./NetworkNode";

interface NodeTooltipProps {
  node: Node<NetworkNodeData>;
}

export function NodeTooltip({ node }: NodeTooltipProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-400";
      case "warning":
        return "text-orange-400";
      default:
        return "text-red-400";
    }
  };

  return (
    <div className="absolute top-2.5 right-2.5 bg-black/80 text-white p-2.5 rounded-md text-xs z-[1000] min-w-[150px]">
      <div>
        <strong>{node.data.label}</strong>
      </div>
      <div>Type: {node.data.type}</div>
      <div>
        Status:{" "}
        <span className={getStatusColor(node.data.status)}>
          {node.data.status}
        </span>
      </div>
      <div>IP: {node.data.ip}</div>
      {node.data.ports && <div>Ports: {node.data.ports}</div>}
      {node.data.cpu && <div>CPU: {node.data.cpu}</div>}
      {node.data.user && <div>User: {node.data.user}</div>}
    </div>
  );
}
