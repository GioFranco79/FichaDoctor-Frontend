"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api } from "@/lib/api";
import {
  setAccessToken,
  setRefreshToken,
  getRefreshToken,
  clearTokens,
  hasSession,
} from "@/lib/auth";

export type UserRole = "Admin" | "Doctor" | "Paciente" | "Secretaria";

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  rut: string;
  role: UserRole;
  is_active: boolean;
  doctor_id?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  session: boolean;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    userData: RegisterData
  ) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

interface RegisterData {
  first_name: string;
  last_name: string;
  rut: string;
  fecha_nacimiento: string;
  role: "Doctor" | "Paciente";
  direccion: string;
  region: string;
  comuna: string;
  especialidad?: string;
}

interface LoginResponse {
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  user: UserProfile;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const profile = await api.get<UserProfile>("/api/auth/me");
      setUser(profile);
      return profile;
    } catch {
      setUser(null);
      clearTokens();
      return null;
    }
  }, []);

  // Al cargar la app, intentar restaurar sesión con el refresh_token guardado
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!hasSession()) {
          setLoading(false);
          return;
        }

        // Intentar renovar el token al inicio para obtener un access_token fresco
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
          const response = await fetch(`${API_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (response.ok) {
            const json = await response.json();
            const data = json.data ?? json;
            setAccessToken(data.access_token);
            setRefreshToken(data.refresh_token);
            await fetchProfile();
          } else if (response.status === 401 || response.status === 403) {
            // Only clear tokens if server explicitly rejects the refresh token
            clearTokens();
          }
          // For other errors (500, network issues), keep tokens and try again next time
        }
      } catch {
        // Network error - don't clear tokens, just leave the user as-is
        // They'll be prompted to login only when they try to make an API call
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const data = await api.post<LoginResponse>("/api/auth/login", {
      email,
      password,
    });

    // Guardar tokens
    setAccessToken(data.session.access_token);
    setRefreshToken(data.session.refresh_token);

    // Guardar perfil del usuario
    setUser(data.user);
  };

  const register = async (
    email: string,
    password: string,
    userData: RegisterData
  ) => {
    await api.post("/api/auth/register", {
      email,
      password,
      ...userData,
    });
  };

  const logout = async () => {
    clearTokens();
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    await api.post("/api/auth/forgot-password", { email });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user,
        session: !!user,
        role: user?.role ?? null,
        loading,
        login,
        register,
        logout,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
