import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  // Window controls
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),

  // File system
  readFile: (filePath: string) => ipcRenderer.invoke('fs-read-file', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs-write-file', filePath, content),
  readDirectory: (dirPath: string) => ipcRenderer.invoke('fs-read-directory', dirPath),
  createDirectory: (dirPath: string) => ipcRenderer.invoke('fs-create-directory', dirPath),
  delete: (targetPath: string) => ipcRenderer.invoke('fs-delete', targetPath),
  rename: (oldPath: string, newPath: string) => ipcRenderer.invoke('fs-rename', oldPath, newPath),
  exists: (targetPath: string) => ipcRenderer.invoke('fs-exists', targetPath),
  getStat: (targetPath: string) => ipcRenderer.invoke('fs-get-stat', targetPath),
  readFileBuffer: (filePath: string) => ipcRenderer.invoke('fs-read-file-buffer', filePath),

  // Dialogs
  openFolder: () => ipcRenderer.invoke('dialog-open-folder'),
  openFile: (filters?: { name: string; extensions: string }[]) => ipcRenderer.invoke('dialog-open-file', filters),
  saveFile: (defaultPath?: string, filters?: { name: string; extensions: string }[]) => ipcRenderer.invoke('dialog-save-file', defaultPath, filters),

  // Shell
  openExternal: (url: string) => ipcRenderer.invoke('shell-open-external', url),
  showItemInFolder: (fullPath: string) => ipcRenderer.invoke('shell-show-item', fullPath),

  // App info
  getPaths: () => ipcRenderer.invoke('app-get-paths'),
  getPlatform: () => ipcRenderer.invoke('app-get-platform'),

  // Auto-update
  updateCheck: () => ipcRenderer.invoke('update-check'),
  updateDownload: () => ipcRenderer.invoke('update-download'),
  updateInstall: () => ipcRenderer.invoke('update-install'),
  updateGetVersion: () => ipcRenderer.invoke('update-get-version'),

  // Terminal
  terminalExec: (command: string, cwd?: string) => ipcRenderer.invoke('terminal-exec', command, cwd),
  terminalGetCwd: () => ipcRenderer.invoke('terminal-get-cwd'),

  // Git
  gitStatus: (cwd: string) => ipcRenderer.invoke('git-status', cwd),
  gitBranch: (cwd: string) => ipcRenderer.invoke('git-branch', cwd),
  gitCommit: (message: string, cwd: string) => ipcRenderer.invoke('git-commit', message, cwd),
  gitLog: (cwd: string, count?: number) => ipcRenderer.invoke('git-log', cwd, count),
  gitDiff: (filePath: string, cwd: string) => ipcRenderer.invoke('git-diff', filePath, cwd),
  gitInit: (cwd: string) => ipcRenderer.invoke('git-init', cwd),

  // Update events
  onUpdateChecking: (callback: () => void) => ipcRenderer.on('update-checking', callback),
  onUpdateAvailable: (callback: (info: any) => void) => ipcRenderer.on('update-available', (_event, info) => callback(info)),
  onUpdateNotAvailable: (callback: () => void) => ipcRenderer.on('update-not-available', callback),
  onUpdateDownloadProgress: (callback: (progress: any) => void) => ipcRenderer.on('update-download-progress', (_event, progress) => callback(progress)),
  onUpdateDownloaded: (callback: (info: any) => void) => ipcRenderer.on('update-downloaded', (_event, info) => callback(info)),
  onUpdateError: (callback: (error: string) => void) => ipcRenderer.on('update-error', (_event, error) => callback(error)),

  // Auth
  authGithubLogin: () => ipcRenderer.invoke('auth-github-login'),
  authLogout: () => ipcRenderer.invoke('auth-logout'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
