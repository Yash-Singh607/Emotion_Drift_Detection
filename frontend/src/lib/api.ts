import { runtimeConfig } from "../config/runtime";

export const AUTH_TOKEN_STORAGE_KEY = "emotion_auth_token";

export interface PredictEmotionRequest {
  message: string;
  session_id?: string;
}

export interface PredictEmotionResponse {
  emotion: string;
  confidence: number;
  drift_score: number;
  risk_level: string;
  escalation_required: boolean;
  session_id: string;
}

export interface HealthResponse {
  status: string;
}

export interface AuthUser {
  id: number;
  email: string;
  role: "admin" | "agent" | "viewer";
  is_verified: boolean;
}

export interface AuthRequest {
  email: string;
  password: string;
  role?: "admin" | "agent" | "viewer";
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
  verification_token?: string | null;
}

export interface GenericMessageResponse {
  message: string;
  debug_token?: string | null;
}

export interface ApiErrorShape {
  error?: string;
  details?: unknown;
}

export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  skipAuth?: boolean;
}

async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = runtimeConfig.requestTimeoutMs, retries = 1, skipAuth = false, ...init } = options;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const token = !skipAuth ? localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) : null;
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${runtimeConfig.apiBaseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
          ...(init.headers || {}),
        },
      });

      clearTimeout(timeout);
      const bodyText = await res.text();
      const parsed = bodyText ? JSON.parse(bodyText) : {};

      if (!res.ok) {
        const parsedError = parsed as ApiErrorShape & { detail?: string };
        if (res.status === 401 && !skipAuth) {
          localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        }
        throw new ApiError(
          parsedError.detail || parsedError.error || `Request failed with status ${res.status}`,
          res.status,
          parsedError.details
        );
      }

      return parsed as T;
    } catch (error) {
      clearTimeout(timeout);

      if (attempt < retries) {
        continue;
      }
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Unable to connect to backend service.");
    }
  }

  throw new ApiError("Request failed after retries.");
}

export const apiClient = {
  async register(payload: AuthRequest): Promise<AuthResponse> {
    return requestJson<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      retries: 0,
      skipAuth: true,
    });
  },

  async login(payload: AuthRequest): Promise<AuthResponse> {
    return requestJson<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      retries: 0,
      skipAuth: true,
    });
  },

  async me(): Promise<AuthUser> {
    return requestJson<AuthUser>("/auth/me", {
      method: "GET",
      retries: 0,
    });
  },

  async forgotPassword(email: string): Promise<GenericMessageResponse> {
    return requestJson<GenericMessageResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      retries: 0,
      skipAuth: true,
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<GenericMessageResponse> {
    return requestJson<GenericMessageResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password: newPassword }),
      retries: 0,
      skipAuth: true,
    });
  },

  async resendVerification(email: string): Promise<GenericMessageResponse> {
    return requestJson<GenericMessageResponse>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
      retries: 0,
      skipAuth: true,
    });
  },

  async verifyEmail(token: string): Promise<GenericMessageResponse> {
    return requestJson<GenericMessageResponse>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
      retries: 0,
      skipAuth: true,
    });
  },

  oauthStartUrl(provider: "google" | "github"): string {
    return `${runtimeConfig.apiBaseUrl}/auth/oauth/${provider}/start`;
  },

  async predictEmotion(payload: PredictEmotionRequest): Promise<PredictEmotionResponse> {
    return requestJson<PredictEmotionResponse>("/predict-emotion", {
      method: "POST",
      body: JSON.stringify(payload),
      retries: 1,
    });
  },

  async health(): Promise<HealthResponse> {
    return requestJson<HealthResponse>("/health", { method: "GET", retries: 0, skipAuth: true });
  },
};

