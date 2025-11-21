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
  login: (email: string, password: string, type: UserType) => Promise<boolean>;
  register: (name: string, email: string, password: string, type: UserType, crmv?: string) => Promise<boolean>;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('univet_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string, type: UserType): Promise<boolean> => {
    // Mock login - verificar usuários cadastrados
    const users = JSON.parse(localStorage.getItem('univet_users') || '[]');
    const foundUser = users.find((u: User) => u.email === email && u.type === type);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('univet_user', JSON.stringify(foundUser));
      return true;
    }
    
    // Criar usuário demo se não existir
    const demoUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: type === 'tutor' ? 'Tutor Demo' : 'Dr. Veterinário Demo',
      email,
      type,
      ...(type === 'veterinarian' && { crmv: 'CRMV-SP 12345' })
    };
    
    setUser(demoUser);
    localStorage.setItem('univet_user', JSON.stringify(demoUser));
    users.push(demoUser);
    localStorage.setItem('univet_users', JSON.stringify(users));
    return true;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    type: UserType,
    crmv?: string
  ): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('univet_users') || '[]');
    
    // Verificar se email já existe
    if (users.some((u: User) => u.email === email)) {
      return false;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      type,
      ...(type === 'veterinarian' && crmv && { crmv })
    };

    users.push(newUser);
    localStorage.setItem('univet_users', JSON.stringify(users));
    
    setUser(newUser);
    localStorage.setItem('univet_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('univet_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
