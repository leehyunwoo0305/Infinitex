import { auth as electronAuth } from '../utils/electron';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  avatar?: string;
  emailVerified: boolean;
  provider?: string;
}

let currentUser: AuthUser | null = null;
let authStateCallbacks: ((user: AuthUser | null) => void)[] = [];

export const loginWithGitHub = async () => {
  const result = await electronAuth.githubLogin();
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

export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  authStateCallbacks.push(callback);
  return () => {
    authStateCallbacks = authStateCallbacks.filter(cb => cb !== callback);
  };
};
