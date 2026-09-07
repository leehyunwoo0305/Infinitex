import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { exec } from 'child_process';
import { autoUpdater } from 'electron-updater';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Infinitex',
    icon: path.join(__dirname, '../public/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#1e1e1e',
    frame: false,
    titleBarStyle: 'hidden',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  if (!isDev) {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('checking-for-update', () => {
      mainWindow?.webContents.send('update-checking');
    });
    autoUpdater.on('update-available', (info) => {
      mainWindow?.webContents.send('update-available', {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes,
      });
    });
    autoUpdater.on('update-not-available', () => {
      mainWindow?.webContents.send('update-not-available');
    });
    autoUpdater.on('download-progress', (progress) => {
      mainWindow?.webContents.send('update-download-progress', {
        percent: progress.percent,
        transferred: progress.transferred,
        total: progress.total,
      });
    });
    autoUpdater.on('update-downloaded', (info) => {
      mainWindow?.webContents.send('update-downloaded', {
        version: info.version,
        releaseDate: info.releaseDate,
      });
    });
    autoUpdater.on('error', (error) => {
      console.error('Auto-update error:', error);
      mainWindow?.webContents.send('update-error', error.message);
    });

    setTimeout(() => {
      autoUpdater.checkForUpdates().catch(() => {});
    }, 5000);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Window controls
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window-close', () => mainWindow?.close());

// File system operations
ipcMain.handle('fs-read-file', async (_event, filePath: string) => {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('fs-write-file', async (_event, filePath: string, content: string) => {
  try {
    await fs.promises.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('fs-read-directory', async (_event, dirPath: string) => {
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const items = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dirPath, entry.name);
        const isDirectory = entry.isDirectory();
        let children;
        if (isDirectory) {
          try {
            const subEntries = await fs.promises.readdir(fullPath, { withFileTypes: true });
            children = subEntries.length;
          } catch {
            children = 0;
          }
        }
        return {
          name: entry.name,
          path: fullPath,
          type: isDirectory ? 'folder' : 'file',
          children,
        };
      })
    );
    return { success: true, items };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('fs-create-directory', async (_event, dirPath: string) => {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('fs-delete', async (_event, targetPath: string) => {
  try {
    const stat = await fs.promises.stat(targetPath);
    if (stat.isDirectory()) {
      await fs.promises.rm(targetPath, { recursive: true });
    } else {
      await fs.promises.unlink(targetPath);
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('fs-rename', async (_event, oldPath: string, newPath: string) => {
  try {
    await fs.promises.rename(oldPath, newPath);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('fs-exists', async (_event, targetPath: string) => {
  try {
    await fs.promises.access(targetPath);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('fs-get-stat', async (_event, targetPath: string) => {
  try {
    const stat = await fs.promises.stat(targetPath);
    return {
      success: true,
      stat: {
        size: stat.size,
        created: stat.birthtime.toISOString(),
        modified: stat.mtime.toISOString(),
        isDirectory: stat.isDirectory(),
        isFile: stat.isFile(),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Dialog operations
ipcMain.handle('dialog-open-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle('dialog-open-file', async (_event, filters?: { name: string; extensions: string[] }[]) => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile', 'multiSelections'],
    filters: filters || [
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  if (result.canceled) return null;
  return result.filePaths;
});

ipcMain.handle('dialog-save-file', async (_event, defaultPath?: string, filters?: { name: string; extensions: string[] }[]) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath,
    filters: filters || [
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  if (result.canceled) return null;
  return result.filePath;
});

// Shell operations
ipcMain.handle('shell-open-external', async (_event, url: string) => {
  await shell.openExternal(url);
});

ipcMain.handle('shell-show-item', async (_event, fullPath: string) => {
  shell.showItemInFolder(fullPath);
});

// App info
ipcMain.handle('app-get-paths', () => {
  return {
    home: os.homedir(),
    desktop: path.join(os.homedir(), 'Desktop'),
    documents: path.join(os.homedir(), 'Documents'),
    downloads: path.join(os.homedir(), 'Downloads'),
    temp: os.tmpdir(),
  };
});

ipcMain.handle('app-get-platform', () => {
  return process.platform;
});

// Read file as buffer (for PDF, images, etc.)
ipcMain.handle('fs-read-file-buffer', async (_event, filePath: string) => {
  try {
    const buffer = await fs.promises.readFile(filePath);
    return { success: true, data: Array.from(buffer) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Auto-update IPC handlers
ipcMain.handle('update-check', async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return {
      success: true,
      updateAvailable: !!result?.updateInfo,
      version: result?.updateInfo.version,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-download', async () => {
  try {
    autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-install', () => {
  autoUpdater.quitAndInstall(false, true);
});

ipcMain.handle('update-get-version', () => app.getVersion());

// Terminal command execution
ipcMain.handle('terminal-exec', async (_event, command: string, cwd?: string) => {
  return new Promise((resolve) => {
    const workDir = cwd || os.homedir();
    exec(command, { cwd: workDir, timeout: 30000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        stdout: stdout || '',
        stderr: stderr || '',
        error: error ? error.message : null,
        code: error ? error.code : 0,
      });
    });
  });
});

ipcMain.handle('terminal-get-cwd', () => {
  return os.homedir();
});

// Git operations
function gitExec(args: string[], cwd: string): Promise<{ success: boolean; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    exec(`git ${args.join(' ')}`, { cwd, timeout: 30000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        stdout: stdout || '',
        stderr: stderr || '',
      });
    });
  });
}

ipcMain.handle('git-status', async (_event, cwd: string) => {
  const result = await gitExec(['status', '--porcelain'], cwd);
  if (!result.success) return { success: false, error: result.stderr, files: [] };

  const files = result.stdout.split('\n').filter(Boolean).map((line) => {
    const indexStatus = line[0];
    const workTreeStatus = line[1];
    const filePath = line.substring(3);

    let status = 'unmodified';
    if (indexStatus === '?' && workTreeStatus === '?') status = 'untracked';
    else if (indexStatus === 'A' || workTreeStatus === 'A') status = 'added';
    else if (indexStatus === 'M' || workTreeStatus === 'M') status = 'modified';
    else if (indexStatus === 'D' || workTreeStatus === 'D') status = 'deleted';
    else if (indexStatus === 'R' || workTreeStatus === 'R') status = 'renamed';
    else if (indexStatus === 'C' || workTreeStatus === 'C') status = 'copied';
    else if (indexStatus === '!' || workTreeStatus === '!') status = 'ignored';

    return { path: filePath, status, indexStatus, workTreeStatus };
  });

  return { success: true, files };
});

ipcMain.handle('git-branch', async (_event, cwd: string) => {
  const result = await gitExec(['branch', '--show-current'], cwd);
  return { success: result.success, branch: result.stdout.trim(), error: result.stderr };
});

ipcMain.handle('git-commit', async (_event, message: string, cwd: string) => {
  const addResult = await gitExec(['add', '.'], cwd);
  if (!addResult.success) return { success: false, error: addResult.stderr };

  const commitResult = await gitExec(['commit', '-m', message], cwd);
  return { success: commitResult.success, stdout: commitResult.stdout, error: commitResult.stderr };
});

ipcMain.handle('git-log', async (_event, cwd: string, count: number = 10) => {
  const result = await gitExec(['log', `--max-count=${count}`, '--pretty=format:%H|%s|%an|%ai'], cwd);
  if (!result.success) return { success: false, error: result.stderr, entries: [] };

  const entries = result.stdout.split('\n').filter(Boolean).map((line) => {
    const [hash, subject, author, date] = line.split('|');
    return { hash, subject, author, date };
  });

  return { success: true, entries };
});

ipcMain.handle('git-diff', async (_event, filePath: string, cwd: string) => {
  const result = await gitExec(['diff', filePath], cwd);
  return { success: result.success, diff: result.stdout, error: result.stderr };
});

ipcMain.handle('git-init', async (_event, cwd: string) => {
  const result = await gitExec(['init'], cwd);
  return { success: result.success, stdout: result.stdout, error: result.stderr };
});

// Git branch operations
ipcMain.handle('git-branch-list', async (_event, cwd: string) => {
  const result = await gitExec(['branch', '-a', '--format=%(refname:short)|%(HEAD)'], cwd);
  if (!result.success) return { success: false, error: result.stderr, branches: [] };

  const branches = result.stdout.split('\n').filter(Boolean).map((line) => {
    const [name, isHead] = line.split('|');
    return { name, isCurrent: isHead === 'true' || name.startsWith('*') };
  });

  return { success: true, branches };
});

ipcMain.handle('git-branch-create', async (_event, branchName: string, cwd: string) => {
  const result = await gitExec(['branch', branchName], cwd);
  return { success: result.success, error: result.stderr };
});

ipcMain.handle('git-branch-delete', async (_event, branchName: string, cwd: string) => {
  const result = await gitExec(['branch', '-D', branchName], cwd);
  return { success: result.success, error: result.stderr };
});

ipcMain.handle('git-branch-switch', async (_event, branchName: string, cwd: string) => {
  const result = await gitExec(['checkout', branchName], cwd);
  return { success: result.success, error: result.stderr };
});

// Git stash operations
ipcMain.handle('git-stash', async (_event, message: string, cwd: string) => {
  const args = message ? ['stash', 'push', '-m', message] : ['stash', 'push'];
  const result = await gitExec(args, cwd);
  return { success: result.success, stdout: result.stdout, error: result.stderr };
});

ipcMain.handle('git-stash-pop', async (_event, cwd: string) => {
  const result = await gitExec(['stash', 'pop'], cwd);
  return { success: result.success, stdout: result.stdout, error: result.stderr };
});

ipcMain.handle('git-stash-list', async (_event, cwd: string) => {
  const result = await gitExec(['stash', 'list', '--pretty=format:%gd|%s|%H'], cwd);
  if (!result.success) return { success: false, error: result.stderr, stashes: [] };

  const stashes = result.stdout.split('\n').filter(Boolean).map((line) => {
    const [ref, message, hash] = line.split('|');
    return { ref, message, hash };
  });

  return { success: true, stashes };
});

ipcMain.handle('git-stash-drop', async (_event, stashRef: string, cwd: string) => {
  const result = await gitExec(['stash', 'drop', stashRef], cwd);
  return { success: result.success, error: result.stderr };
});

// Git merge
ipcMain.handle('git-merge', async (_event, branchName: string, cwd: string) => {
  const result = await gitExec(['merge', branchName], cwd);
  return { success: result.success, stdout: result.stdout, error: result.stderr };
});

// Git pull/push
ipcMain.handle('git-pull', async (_event, cwd: string) => {
  const result = await gitExec(['pull'], cwd);
  return { success: result.success, stdout: result.stdout, error: result.stderr };
});

ipcMain.handle('git-push', async (_event, cwd: string) => {
  const result = await gitExec(['push'], cwd);
  return { success: result.success, stdout: result.stdout, error: result.stderr };
});

// Git remote
ipcMain.handle('git-remote', async (_event, cwd: string) => {
  const result = await gitExec(['remote', '-v'], cwd);
  if (!result.success) return { success: false, error: result.stderr, remotes: [] };

  const remotes = result.stdout.split('\n').filter(Boolean).map((line) => {
    const [name, url] = line.split(/\s+/);
    return { name, url };
  });

  return { success: true, remotes };
});
