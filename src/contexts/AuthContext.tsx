import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { loginWithGitHub, logoutUser, onAuthStateChange, getCurrentUser } from '../config/firebase';
import type { AuthUser } from '../config/firebase';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loginGithub: () => Promise<void>;
  logout: () => Promise<void>;
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
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginGithub = async () => {
    await loginWithGitHub();
  };

  const logout = async () => {
    await logoutUser();
  };

  const value: AuthContextType = {
    user,
    loading,
    loginGithub,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
