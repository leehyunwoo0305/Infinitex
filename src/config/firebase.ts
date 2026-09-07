import { auth as electronAuth } from '../utils/electron';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
}

let currentUser: AuthUser | null = null;
let authStateCallbacks: ((user: AuthUser | null) => void)[] = [];

export const registerUser = async (email: string, password: string, displayName: string) => {
  const result = await electronAuth.register(email, password, displayName);
  if (!result.success) {
    throw new Error(result.error);
  }
  currentUser = result.user!;
  authStateCallbacks.forEach(cb => cb(currentUser));
  return currentUser;
};

export const loginUser = async (email: string, password: string) => {
  const result = await electronAuth.login(email, password);
  if (!result.success) {
    throw new Error(result.error);
  }
  currentUser = result.user!;
  authStateCallbacks.forEach(cb => cb(currentUser));
  return currentUser;
};

export const logoutUser = async () => {
  await electronAuth.logout();
  currentUser = null;
  authStateCallbacks.forEach(cb => cb(null));
};

export const verifyEmail = async (email: string, code: string) => {
  const result = await electronAuth.verifyEmail(email, code);
  if (!result.success) {
    throw new Error(result.error);
  }
  currentUser = result.user!;
  authStateCallbacks.forEach(cb => cb(currentUser));
  return currentUser;
};

export const resendVerification = async (email: string) => {
  const result = await electronAuth.resendVerification(email);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.verificationCode;
};

export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  authStateCallbacks.push(callback);
  
  // Return unsubscribe function
  return () => {
    authStateCallbacks = authStateCallbacks.filter(cb => cb !== callback);
  };
};