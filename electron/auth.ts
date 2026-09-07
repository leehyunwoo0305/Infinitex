import { ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import * as crypto from 'crypto';

interface User {
  uid: string;
  email: string;
  password: string;
  displayName: string;
  emailVerified: boolean;
  verificationCode: string | null;
  createdAt: string;
}

const DATA_DIR = path.join(app.getPath('userData'), 'auth');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadUsers(): User[] {
  ensureDataDir();
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load users:', e);
  }
  return [];
}

function saveUsers(users: User[]) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateUid(): string {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function setupAuthHandlers() {
  // Register
  ipcMain.handle('auth-register', async (_event, email: string, password: string, displayName: string) => {
    const users = loadUsers();
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: '이미 사용 중인 이메일입니다.' };
    }

    const user: User = {
      uid: generateUid(),
      email,
      password: hashPassword(password),
      displayName,
      emailVerified: false,
      verificationCode: generateVerificationCode(),
      createdAt: new Date().toISOString()
    };

    users.push(user);
    saveUsers(users);

    return { 
      success: true, 
      user: { uid: user.uid, email: user.email, displayName: user.displayName, emailVerified: false },
      verificationCode: user.verificationCode
    };
  });

  // Login
  ipcMain.handle('auth-login', async (_event, email: string, password: string) => {
    const users = loadUsers();
    const user = users.find(u => u.email === email && u.password === hashPassword(password));
    
    if (!user) {
      return { success: false, error: '이메일 또는 비밀번호가 틀렸습니다.' };
    }

    return { 
      success: true, 
      user: { uid: user.uid, email: user.email, displayName: user.displayName, emailVerified: user.emailVerified }
    };
  });

  // Verify Email
  ipcMain.handle('auth-verify-email', async (_event, email: string, code: string) => {
    const users = loadUsers();
    const user = users.find(u => u.email === email && u.verificationCode === code);
    
    if (!user) {
      return { success: false, error: '인증 코드가 틀렸습니다.' };
    }

    user.emailVerified = true;
    user.verificationCode = null;
    saveUsers(users);

    return { 
      success: true, 
      user: { uid: user.uid, email: user.email, displayName: user.displayName, emailVerified: true }
    };
  });

  // Resend Verification Code
  ipcMain.handle('auth-resend-verification', async (_event, email: string) => {
    const users = loadUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }

    user.verificationCode = generateVerificationCode();
    saveUsers(users);

    return { success: true, verificationCode: user.verificationCode };
  });

  // Get User
  ipcMain.handle('auth-get-user', async (_event, email: string) => {
    const users = loadUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }

    return { 
      success: true, 
      user: { uid: user.uid, email: user.email, displayName: user.displayName, emailVerified: user.emailVerified }
    };
  });

  // Logout (client-side only, but we keep it for consistency)
  ipcMain.handle('auth-logout', async () => {
    return { success: true };
  });
}