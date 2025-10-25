// Network data hook - Easy integration point for backend developer
// Backend dev: Just replace the service calls in this file!

import { useState, useEffect } from "react";
import {
  fetchNetworkTopology,
  subscribeToNetworkUpdates,
  type NetworkTopology,
} from "@/services/networkService";

export function useNetworkData() {
  const [topology, setTopology] = useState<NetworkTopology | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchNetworkTopology();
        setTopology(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load network data"
        );
        console.error("Network data load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Refresh data every 30 seconds
    const refreshInterval = setInterval(loadData, 30000);

    // Subscribe to real-time updates
    const unsubscribe = subscribeToNetworkUpdates((update) => {
      setTopology((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          devices: prev.devices.map((device) =>
            device.id === update.deviceId
              ? { ...device, status: update.status as any }
              : device
          ),
        };
      });
    });

    return () => {
      clearInterval(refreshInterval);
      unsubscribe();
    };
  }, []);

  return { topology, loading, error, refetch: () => fetchNetworkTopology() };
}
