import { useCallback, useState } from "react";

export function useTelemetryLogs() {
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Live Telemetry Engine active.`,
    `[${new Date().toLocaleTimeString()}] Tracked model parameters: GoEmotions V2 DistilBERT.`,
    `[${new Date().toLocaleTimeString()}] Dynamic Drift Memory compounded check active.`,
  ]);

  const addTelemetryLog = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setTelemetryLogs((prev) => [`[${timestamp}] ${msg}`, ...prev].slice(0, 40));
  }, []);

  return { telemetryLogs, addTelemetryLog };
}

