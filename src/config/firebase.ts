import { auth as electronAuth } from '../utils/electron';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  avatar?: string;
  emailVerified: boolean;
  provider?: string;
}

const STORAGE_KEY = 'infinitex-auth-user';

let currentUser: AuthUser | null = null;
let authStateCallbacks: ((user: AuthUser | null) => void)[] = [];

// Load user from localStorage on startup
const loadSavedUser = (): AuthUser | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load saved user:', e);
  }
  return null;
};

// Save user to localStorage
const saveUser = (user: AuthUser | null) => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save user:', e);
  }
};

// Initialize user from localStorage
currentUser = loadSavedUser();
if (currentUser) {
  // Notify any early listeners
  setTimeout(() => {
    authStateCallbacks.forEach(cb => cb(currentUser));
  }, 0);
}

export const loginWithGitHub = async () => {
  const result = await electronAuth.githubLogin();
  if (!result.success) {
    throw new Error(result.error);
  }
  currentUser = result.user!;
  saveUser(currentUser);
  authStateCallbacks.forEach(cb => cb(currentUser));
  return currentUser;
};

export const logoutUser = async () => {
  await electronAuth.logout();
  currentUser = null;
  saveUser(null);
  authStateCallbacks.forEach(cb => cb(null));
};

export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  authStateCallbacks.push(callback);
  
  // Immediately call with current user
  if (currentUser) {
    callback(currentUser);
  }
  
  return () => {
    authStateCallbacks = authStateCallbacks.filter(cb => cb !== callback);
  };
};

export const getCurrentUser = (): AuthUser | null => currentUser;
