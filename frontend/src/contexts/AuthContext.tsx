import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserType = 'tutor' | 'veterinarian';

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  crmv?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, type: UserType) => Promise<User | false>;
  register: (
    name: string,
    email: string,
    password: string,
    type: UserType,
    crmv?: string
  ) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Normaliza qualquer coisa que venha do backend para "tutor" | "veterinarian"
const normalizeToUserType = (value: any): UserType => {
  if (!value) return 'tutor';

  const str = value.toString().trim().toLowerCase();

  if (
    str.includes('vet') ||       // vet, veterinarian, veterinario...
    str.includes('veterin') ||
    str === 'veterinarian'
  ) {
    return 'veterinarian';
  }

  return 'tutor';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('univet_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const normalized: User = {
          id: String(parsed.id),
          name: parsed.name ?? '',
          email: parsed.email,
          type: normalizeToUserType(parsed.type ?? parsed.role),
          crmv: parsed.crmv,
        };
        setUser(normalized);
      } catch (e) {
        console.error('Erro ao carregar usuário do localStorage:', e);
      }
    }
  }, []);

  // -----------------------------
  // LOGIN REAL (Flask)
  // -----------------------------
  const login = async (
    email: string,
    password: string,
    type: UserType
  ): Promise<User | false> => {
    try {
      const response = await fetch('http://192.168.1.5:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });


      if (!response.ok) return false;

      const data = await response.json();

      const rawRole = data.user?.role;
      console.log('[Auth] role vinda do backend:', rawRole);

      const backendUser: User = {
        id: String(data.user.id),
        name: data.user.name ?? '',
        email: data.user.email,
        type: normalizeToUserType(rawRole),
        crmv: data.user.crmv ?? undefined,
      };

      localStorage.setItem('univet_token', data.access_token);
      localStorage.setItem('univet_user', JSON.stringify(backendUser));

      setUser(backendUser);

      return backendUser;
    } catch (err) {
      console.error('Erro login:', err);
      return false;
    }
  };

  // -----------------------------
  // REGISTER REAL (Flask) + auto login, retornando mensagem
  // -----------------------------
  const register = async (
    name: string,
    email: string,
    password: string,
    type: UserType,
    crmv?: string
  ): Promise<{ ok: boolean; message?: string }> => {
    try {
      const response = await fetch('http://192.168.1.5:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role: type === 'veterinarian' ? 'vet' : 'tutor',
          crmv: type === 'veterinarian' ? crmv : undefined,
        }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        return {
          ok: false,
          message: data?.message || 'Erro ao cadastrar',
        };
      }

      // se cadastrou, já faz login automático
      const loggedUser = await login(email, password, type);
      if (!loggedUser) {
        return {
          ok: false,
          message: 'Cadastro realizado, mas houve erro ao fazer login automático.',
        };
      }

      return { ok: true, message: data?.message };
    } catch (err) {
      console.error('Erro register:', err);
      return { ok: false, message: 'Erro inesperado ao cadastrar.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('univet_user');
    localStorage.removeItem('univet_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};