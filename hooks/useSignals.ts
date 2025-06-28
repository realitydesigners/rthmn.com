import { useEffect, useState, useRef } from "react";

interface Signal {
  id: string;
  pair: string;
  signal: number[];
  boxes: number[];
  start_time: string;
  created_at: string;
}

export function useSignals() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [newSignals, setNewSignals] = useState<Signal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const lastCheckRef = useRef<string | null>(null);

  // Direct REST API call instead of Supabase client
  const fetchSignals = async (isInitial = false) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.error("Missing Supabase credentials");
        return;
      }

      // Direct REST API call
      const response = await fetch(
        `${supabaseUrl}/rest/v1/signals?order=created_at.desc&limit=50`,
        {
          method: "GET",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
        }
      );

      if (!response.ok) {
        console.error("HTTP error:", response.status, response.statusText);
        setIsConnected(false);
        return;
      }

      const data = await response.json();
      console.log("Successfully fetched signals:", data.length);
      setIsConnected(true);

      if (data) {
        setSignals(data);

        if (isInitial) {
          // On initial load, show last 3 as new
          if (data.length > 0) {
            setNewSignals(data);
            lastCheckRef.current = data[0]?.created_at || null;
          }
        } else {
          // Check for new signals since last check
          if (lastCheckRef.current && data.length > 0) {
            const newSignalsSinceLastCheck = data.filter(
              (signal: Signal) => signal.created_at > lastCheckRef.current!
            );

            if (newSignalsSinceLastCheck.length > 0) {
              setNewSignals((prev) => [...newSignalsSinceLastCheck, ...prev]);
              lastCheckRef.current = data[0].created_at;
            }
          }
        }
      }
    } catch (error) {
      console.error("Direct API call error:", error);
      setIsConnected(false);
    } finally {
      if (isInitial) {
        setIsLoading(false);
      }
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
    fetchSignals(true);

    // Set up polling every 10 seconds
    const interval = setInterval(() => {
      fetchSignals(false);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    signals,
    newSignals,
    isLoading,
    isConnected,
    clearSignalAlert,
    clearAllAlerts,
    refetch: () => fetchSignals(true),
  };
}
