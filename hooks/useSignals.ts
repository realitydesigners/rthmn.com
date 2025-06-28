import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Signal {
  id: string;
  pair: string;
  pattern_info: number[];
  boxes: number[];
  start_time: string;
  created_at: string;
}

export function useSignals(refreshInterval = 10000) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [newSignals, setNewSignals] = useState<Signal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  // Use the same client creation as SupabaseProvider
  const supabase = createClient();

  const fetchSignals = async (retryCount = 0) => {
    try {
      const { data, error } = await supabase
        .from("signals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching signals:", error);

        // Retry on network errors (max 2 retries)
        if (retryCount < 2 && error.message?.includes("NetworkError")) {
          setTimeout(() => fetchSignals(retryCount + 1), 2000);
          return;
        }
        return;
      }

      if (data) {
        const currentTime = new Date().toISOString();

        // TEMPORARY: Always show recent signals for debugging
        if (data.length > 0) {
          setNewSignals(data.slice(0, 5)); // Show last 5 as new always
        } else {
          setNewSignals([]);
        }

        setSignals(data);
        setLastChecked(currentTime);
      } else {
        setNewSignals([]);
      }
    } catch (error) {
      console.error("Error in fetchSignals:", error);

      // Retry on network errors (max 2 retries)
      if (retryCount < 2) {
        setTimeout(() => fetchSignals(retryCount + 1), 2000);
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Clear a specific new signal alert
  const clearSignalAlert = (signalId: string) => {
    setNewSignals((prev) => prev.filter((signal) => signal.id !== signalId));
  };

  // Clear all signal alerts
  const clearAllAlerts = () => {
    setNewSignals([]);
  };

  useEffect(() => {
    // Initial fetch
    fetchSignals();

    // Set up interval for polling
    const interval = setInterval(() => {
      fetchSignals();
    }, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [refreshInterval]);

  return {
    signals,
    newSignals,
    isLoading,
    clearSignalAlert,
    clearAllAlerts,
    refetch: fetchSignals,
  };
}
