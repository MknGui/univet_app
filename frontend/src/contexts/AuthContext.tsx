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
  specialty?: string | null;
  phone?: string | null;
  clinic_id?: number | null;
  clinic_name?: string | null;
  clinic_region?: string | null;
  // compat: alguns lugares usam "type" em vez de "role"
  type?: "tutor" | "veterinarian" | string;
};

type LoginResponse = {
  access_token: string;
  user: AuthUser;
};

type RegisterResult = {
  ok: boolean;
  message?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (
    email: string,
    password: string,
    roleHint?: string
  ) => Promise<AuthUser | null>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "tutor" | "veterinarian" | string,
    crmv?: string,
    specialty?: string,
    phone?: string
  ) => Promise<RegisterResult>;
  logout: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
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
    const data = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    const authUser: AuthUser = {
      ...data.user,
      type: (data.user as any).type ?? data.user.role,
    };

    setUser(authUser);
    return authUser;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "tutor" | "veterinarian" | string,
    crmv?: string,
    specialty?: string,
    phone?: string
  ): Promise<RegisterResult> => {
    try {
      // chama o endpoint de cadastro
      await apiRequest<{ message?: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          crmv: role === "veterinarian" ? crmv : undefined,
          specialty: role === "veterinarian" ? specialty : undefined,
          phone,
        }),
      });

      // depois do cadastro, tenta login automático
      try {
        await login(email, password);
      } catch (err) {
        console.error(
          "Erro ao fazer login automático após registro:",
          err
        );
      }

      return {
        ok: true,
        message: "Cadastro realizado com sucesso!",
      };
    } catch (error: any) {
      console.error(error);
      return {
        ok: false,
        message: error?.message ?? "Erro ao cadastrar usuário",
      };
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }
    setUser(null);
  };

  const updateUser = (partial: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
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
