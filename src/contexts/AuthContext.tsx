import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  registerUser, 
  loginUser, 
  loginWithGitHub,
  logoutUser, 
  onAuthStateChange,
  verifyEmail,
  resendVerification
} from '../config/firebase';
import type { AuthUser } from '../config/firebase';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginGithub: () => Promise<void>;
  logout: () => Promise<void>;
  verify: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<string | null>;
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

    setLoading(false);
    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, displayName: string) => {
    await registerUser(email, password, displayName);
  };

  const login = async (email: string, password: string) => {
    await loginUser(email, password);
  };

  const loginGithub = async () => {
    await loginWithGitHub();
  };

  const logout = async () => {
    await logoutUser();
  };

  const verify = async (email: string, code: string) => {
    await verifyEmail(email, code);
  };

  const resendCode = async (email: string): Promise<string | null> => {
    return await resendVerification(email) ?? null;
  };

  const isEmailVerified = user?.emailVerified ?? false;

  const value: AuthContextType = {
    user,
    loading,
    register,
    login,
    loginGithub,
    logout,
    verify,
    resendCode,
    isEmailVerified
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};