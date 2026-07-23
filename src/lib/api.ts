import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearTokens,
} from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Intenta renovar el access_token usando el refresh_token almacenado.
 * Retorna true si la renovación fue exitosa.
 */
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const json = await response.json();
    const data = json.data ?? json;

    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

/**
 * Cliente HTTP centralizado que envía todas las peticiones al backend API.
 * - Adjunta automáticamente el access_token
 * - Reintenta con refresh si recibe 401
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Si recibimos 401 y tenemos refresh_token, intentar renovar
  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(endpoint, options, false);
    }
    // Si no se pudo renovar, limpiar tokens y lanzar error
    clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Sesión expirada");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // Include field-specific details if available
    let message = errorData.message || `Error ${response.status}: ${response.statusText}`;
    if (errorData.details && Array.isArray(errorData.details)) {
      const fieldErrors = errorData.details.map((d: { field: string; message: string }) => `${d.field}: ${d.message}`).join('; ');
      message = `${message} (${fieldErrors})`;
    }
    throw new Error(message);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  const json = await response.json();

  // El backend retorna { success: true, data: ... }
  if (json.success !== undefined) {
    return json.data as T;
  }

  return json as T;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
