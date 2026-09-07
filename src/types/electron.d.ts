interface ElectronAPI {
  windowMinimize: () => void;
  windowMaximize: () => void;
  windowClose: () => void;

  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  readDirectory: (dirPath: string) => Promise<{
    success: boolean;
    items?: Array<{ name: string; path: string; type: string; children?: number }>;
    error?: string;
  }>;
  createDirectory: (dirPath: string) => Promise<{ success: boolean; error?: string }>;
  delete: (targetPath: string) => Promise<{ success: boolean; error?: string }>;
  rename: (oldPath: string, newPath: string) => Promise<{ success: boolean; error?: string }>;
  exists: (targetPath: string) => Promise<boolean>;
  getStat: (targetPath: string) => Promise<{
    success: boolean;
    stat?: {
      size: number;
      created: string;
      modified: string;
      isDirectory: boolean;
      isFile: boolean;
    };
    error?: string;
  }>;
  readFileBuffer: (filePath: string) => Promise<{ success: boolean; data?: number[]; error?: string }>;

  openFolder: () => Promise<string | null>;
  openFile: (filters?: { name: string; extensions: string[] }[]) => Promise<string[] | null>;
  saveFile: (defaultPath?: string, filters?: { name: string; extensions: string[] }[]) => Promise<string | null>;

  openExternal: (url: string) => Promise<void>;
  showItemInFolder: (fullPath: string) => Promise<void>;

  getPaths: () => Promise<{
    home: string;
    desktop: string;
    documents: string;
    downloads: string;
    temp: string;
  }>;
  getPlatform: () => Promise<string>;

  // Terminal
  terminalExec: (command: string, cwd?: string) => Promise<{
    success: boolean;
    stdout: string;
    stderr: string;
    error: string | null;
    code: number | undefined;
  }>;
  terminalGetCwd: () => Promise<string>;

  // Git
  gitStatus: (cwd: string) => Promise<{
    success: boolean;
    files: Array<{ path: string; status: string; indexStatus: string; workTreeStatus: string }>;
    error?: string;
  }>;
  gitBranch: (cwd: string) => Promise<{ success: boolean; branch: string; error?: string }>;
  gitCommit: (message: string, cwd: string) => Promise<{ success: boolean; stdout?: string; error?: string }>;
  gitLog: (cwd: string, count?: number) => Promise<{
    success: boolean;
    entries: Array<{ hash: string; subject: string; author: string; date: string }>;
    error?: string;
  }>;
  gitDiff: (filePath: string, cwd: string) => Promise<{ success: boolean; diff: string; error?: string }>;
  gitInit: (cwd: string) => Promise<{ success: boolean; stdout?: string; error?: string }>;

  // Git branch operations
  gitBranchList: (cwd: string) => Promise<{
    success: boolean;
    branches: Array<{ name: string; isCurrent: boolean }>;
    error?: string;
  }>;
  gitBranchCreate: (branchName: string, cwd: string) => Promise<{ success: boolean; error?: string }>;
  gitBranchDelete: (branchName: string, cwd: string) => Promise<{ success: boolean; error?: string }>;
  gitBranchSwitch: (branchName: string, cwd: string) => Promise<{ success: boolean; error?: string }>;

  // Git stash operations
  gitStash: (message: string, cwd: string) => Promise<{ success: boolean; stdout?: string; error?: string }>;
  gitStashPop: (cwd: string) => Promise<{ success: boolean; stdout?: string; error?: string }>;
  gitStashList: (cwd: string) => Promise<{
    success: boolean;
    stashes: Array<{ ref: string; message: string; hash: string }>;
    error?: string;
  }>;
  gitStashDrop: (stashRef: string, cwd: string) => Promise<{ success: boolean; error?: string }>;

  // Git merge
  gitMerge: (branchName: string, cwd: string) => Promise<{ success: boolean; stdout?: string; error?: string }>;

  // Git pull/push
  gitPull: (cwd: string) => Promise<{ success: boolean; stdout?: string; error?: string }>;
  gitPush: (cwd: string) => Promise<{ success: boolean; stdout?: string; error?: string }>;

  // Git remote
  gitRemote: (cwd: string) => Promise<{
    success: boolean;
    remotes: Array<{ name: string; url: string }>;
    error?: string;
  }>;

  // Auto-update
  updateCheck: () => Promise<{ success: boolean; updateAvailable?: boolean; version?: string; error?: string }>;
  updateDownload: () => Promise<{ success: boolean; error?: string }>;
  updateInstall: () => void;
  updateGetVersion: () => Promise<string>;

  // Update events
  onUpdateChecking: (callback: () => void) => void;
  onUpdateAvailable: (callback: (info: { version: string; releaseDate: string; releaseNotes: string }) => void) => void;
  onUpdateNotAvailable: (callback: () => void) => void;
  onUpdateDownloadProgress: (callback: (progress: { percent: number; transferred: number; total: number }) => void) => void;
  onUpdateDownloaded: (callback: (info: { version: string; releaseDate: string }) => void) => void;
  onUpdateError: (callback: (error: string) => void) => void;

  // Auth
  authRegister: (email: string, password: string, displayName: string) => Promise<{
    success: boolean;
    user?: { uid: string; email: string; displayName: string; emailVerified: boolean };
    verificationCode?: string;
    error?: string;
  }>;
  authLogin: (email: string, password: string) => Promise<{
    success: boolean;
    user?: { uid: string; email: string; displayName: string; emailVerified: boolean };
    error?: string;
  }>;
  authVerifyEmail: (email: string, code: string) => Promise<{
    success: boolean;
    user?: { uid: string; email: string; displayName: string; emailVerified: boolean };
    error?: string;
  }>;
  authResendVerification: (email: string) => Promise<{
    success: boolean;
    verificationCode?: string;
    error?: string;
  }>;
  authGetUser: (email: string) => Promise<{
    success: boolean;
    user?: { uid: string; email: string; displayName: string; emailVerified: boolean };
    error?: string;
  }>;
  authLogout: () => Promise<{ success: boolean }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
