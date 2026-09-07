import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  onAuthStateChange,
  sendVerificationEmail,
  auth
} from '../config/firebase';
import type { AuthUser } from '../config/firebase';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sendVerification: () => Promise<void>;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, displayName: string) => {
    await registerUser(email, password, displayName);
  };

  const login = async (email: string, password: string) => {
    await loginUser(email, password);
  };

  const logout = async () => {
    await logoutUser();
  };

  const sendVerification = async () => {
    if (auth.currentUser) {
      await sendVerificationEmail(auth.currentUser);
    }
  };

  const isEmailVerified = user?.emailVerified ?? false;

  const value: AuthContextType = {
    user,
    loading,
    register,
    login,
    logout,
    sendVerification,
    isEmailVerified
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};