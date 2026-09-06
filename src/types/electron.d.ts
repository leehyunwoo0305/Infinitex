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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
