import { useState } from "react";
import { NetworkMap } from "@/components/NetworkMap";
import { SelectedNodePanel } from "@/components/SelectedNodePanel";
import type { Node } from "reactflow";

export function Dashboard() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  return (
    <div className="layout-main-content">
      <header>
        <h1>Welcome to the dashboard</h1>
      </header>
      <main>
        <NetworkMap onNodeSelect={setSelectedNode} />
      </main>
      <div className="mission-clock">Mission Clock</div>
      <aside>
        {selectedNode ? (
          <SelectedNodePanel node={selectedNode} />
        ) : (
          <div className="text-muted-foreground p-4">
            Select a network device to view details
          </div>
        )}
      </aside>
    </div>
  );
}
