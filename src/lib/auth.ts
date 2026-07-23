/**
 * Manejo de tokens de autenticación.
 * - access_token: en memoria (más seguro, no persiste en storage)
 * - refresh_token: en cookie httpOnly-like (accessible por middleware) + localStorage como fallback
 */

let accessToken: string | null = null;

const REFRESH_TOKEN_KEY = "fichadoctor_refresh_token";

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
    // También guardar en cookie para que el middleware pueda verificar sesión
    document.cookie = `${REFRESH_TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; max-age=0`;
  }
}

export function clearTokens(): void {
  accessToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; max-age=0`;
  }
}

export function hasSession(): boolean {
  return !!accessToken || !!getRefreshToken();
}
