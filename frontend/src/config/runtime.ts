const appMode = (import.meta.env.VITE_APP_MODE || "production").toLowerCase();

export const runtimeConfig = {
  apiBaseUrl: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  appMode,
  isDemoMode: appMode === "demo",
  requestTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS || 8000),
};

