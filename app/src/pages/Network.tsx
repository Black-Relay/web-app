import { useState } from "react";
import { NetworkMap } from "@/components/NetworkMap";
import { NetworkAside } from "@/components/network-aside";
import { MissionClock } from "@/components/mission-clock";
import type { Node } from "reactflow";
import type { SimpleNodeData } from "@/components/SimpleNetworkNode";
import "../css/reactflow.css";

export function Network() {
  const [selectedNode, setSelectedNode] = useState<Node<SimpleNodeData> | null>(
    null
  );
  const [mission] = useState("Network Operations"); // convert to context

  const handleNodeSelect = (node: Node<SimpleNodeData> | null) => {
    setSelectedNode(node);
  };

  return (
    <div className="layout-main-content">
      <header>
        <h1>{mission}</h1>
      </header>
      <main>
        <NetworkMap onNodeSelect={handleNodeSelect} />
      </main>
      <MissionClock />
      <aside>
        <NetworkAside selectedNode={selectedNode} />
      </aside>
      <footer>
        <MissionClock zone={+9} title="Pacific" />
        <MissionClock zone={+2} title="Germany" />
        <MissionClock zone={-4} title="Eastern" />
        <MissionClock zone={-6} title="Mountain" />
      </footer>
    </div>
  );
}
