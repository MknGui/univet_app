// frontend/src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiRequest } from "@/api/client";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "tutor" | "veterinarian" | string;
  crmv?: string | null;
  // compat: alguns lugares usam "type" em vez de "role"
  type?: "tutor" | "veterinarian" | string;
};

type LoginResponse = {
  access_token: string;
  user: AuthUser;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (
    email: string,
    password: string,
    roleHint?: string
  ) => Promise<AuthUser | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("user");
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // Se tiver user no localStorage mas o state estiver nulo, sincroniza
    if (!user && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          setUser(JSON.parse(stored) as AuthUser);
        }
      } catch {
        // ignora erro de parse
      }
    }
  }, [user]);

  const login = async (
    email: string,
    password: string,
    _roleHint?: string
  ): Promise<AuthUser | null> => {
    // Chama backend /api/auth/login
    const data = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Salva token para o client.ts usar (Authorization: Bearer)
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    const authUser: AuthUser = {
      ...data.user,
      // compat: garante que "type" exista se alguém usar
      type: (data.user as any).type ?? data.user.role,
    };

    setUser(authUser);
    return authUser;
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return ctx;
};