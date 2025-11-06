import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { api } from "../api/api";
import { storage } from "../utils/storage";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(() => {
    // Check localStorage for existing user session
    return storage.getUser();
  });

  useEffect(() => {
    if (user) {
      storage.setUser(user);
    } else {
      storage.clearUser();
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user: userData } = await api.login(email, password);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.createUser(email, password, name);
      // User is already stored in localStorage by the API call
      // Just update the state with the returned user data
      const newUser: User = {
        id: response.id,
        name: response.name,
        email: response.email,
      };
      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    }
  };

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser,
  }), [user]);

  return (
    <AuthContext.Provider value={contextValue}>
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
