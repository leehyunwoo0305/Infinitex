const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

export const electronAPI = isElectron ? window.electronAPI : null;

export const isElectronApp = isElectron;

// Fallback for web environment
export const fileSystem = {
  async readFile(path: string): Promise<string> {
    if (electronAPI) {
      const result = await electronAPI.readFile(path);
      if (result.success) return result.content || '';
      throw new Error(result.error);
    }
    throw new Error('File system not available in web mode');
  },

  async writeFile(path: string, content: string): Promise<void> {
    if (electronAPI) {
      const result = await electronAPI.writeFile(path, content);
      if (!result.success) throw new Error(result.error);
      return;
    }
    throw new Error('File system not available in web mode');
  },

  async readDirectory(path: string): Promise<Array<{ name: string; path: string; type: string; children?: number }>> {
    if (electronAPI) {
      const result = await electronAPI.readDirectory(path);
      if (result.success) return result.items || [];
      throw new Error(result.error);
    }
    throw new Error('File system not available in web mode');
  },

  async exists(path: string): Promise<boolean> {
    if (electronAPI) {
      return electronAPI.exists(path);
    }
    return false;
  },

  async createDirectory(path: string): Promise<void> {
    if (electronAPI) {
      const result = await electronAPI.createDirectory(path);
      if (!result.success) throw new Error(result.error);
      return;
    }
    throw new Error('File system not available in web mode');
  },

  async delete(targetPath: string): Promise<void> {
    if (electronAPI) {
      const result = await electronAPI.delete(targetPath);
      if (!result.success) throw new Error(result.error);
      return;
    }
    throw new Error('File system not available in web mode');
  },

  async rename(oldPath: string, newPath: string): Promise<void> {
    if (electronAPI) {
      const result = await electronAPI.rename(oldPath, newPath);
      if (!result.success) throw new Error(result.error);
      return;
    }
    throw new Error('File system not available in web mode');
  },

  async getStat(path: string) {
    if (electronAPI) {
      const result = await electronAPI.getStat(path);
      if (result.success) return result.stat;
      throw new Error(result.error);
    }
    throw new Error('File system not available in web mode');
  },

  async readFileBuffer(path: string): Promise<number[]> {
    if (electronAPI) {
      const result = await electronAPI.readFileBuffer(path);
      if (result.success) return result.data || [];
      throw new Error(result.error);
    }
    throw new Error('File system not available in web mode');
  },
};

export const dialog = {
  async openFolder(): Promise<string | null> {
    if (electronAPI) {
      return electronAPI.openFolder();
    }
    return null;
  },

  async openFile(filters?: { name: string; extensions: string[] }[]): Promise<string[] | null> {
    if (electronAPI) {
      return electronAPI.openFile(filters);
    }
    return null;
  },

  async saveFile(defaultPath?: string, filters?: { name: string; extensions: string[] }[]): Promise<string | null> {
    if (electronAPI) {
      return electronAPI.saveFile(defaultPath, filters);
    }
    return null;
  },
};

export const windowControls = {
  minimize: () => electronAPI?.windowMinimize(),
  maximize: () => electronAPI?.windowMaximize(),
  close: () => electronAPI?.windowClose(),
};

export const appPaths = {
  async get() {
    if (electronAPI) {
      return electronAPI.getPaths();
    }
    return {
      home: '~',
      desktop: '~/Desktop',
      documents: '~/Documents',
      downloads: '~/Downloads',
      temp: '/tmp',
    };
  },

  async getPlatform(): Promise<string> {
    if (electronAPI) {
      return electronAPI.getPlatform();
    }
    return 'web';
  },
};

// Auto-update
export const updater = {
  async checkForUpdates() {
    if (electronAPI) {
      return electronAPI.updateCheck();
    }
    return { success: false, error: 'Auto-update not available in web mode' };
  },

  async downloadUpdate() {
    if (electronAPI) {
      return electronAPI.updateDownload();
    }
    return { success: false, error: 'Auto-update not available in web mode' };
  },

  installUpdate() {
    if (electronAPI) {
      electronAPI.updateInstall();
    }
  },

  async getVersion(): Promise<string> {
    if (electronAPI) {
      return electronAPI.updateGetVersion();
    }
    return '1.0.0';
  },

  onChecking(callback: () => void) {
    electronAPI?.onUpdateChecking(callback);
  },

  onAvailable(callback: (info: { version: string; releaseDate: string; releaseNotes: string }) => void) {
    electronAPI?.onUpdateAvailable(callback);
  },

  onNotAvailable(callback: () => void) {
    electronAPI?.onUpdateNotAvailable(callback);
  },

  onProgress(callback: (progress: { percent: number; transferred: number; total: number }) => void) {
    electronAPI?.onUpdateDownloadProgress(callback);
  },

  onDownloaded(callback: (info: { version: string; releaseDate: string }) => void) {
    electronAPI?.onUpdateDownloaded(callback);
  },

  onError(callback: (error: string) => void) {
    electronAPI?.onUpdateError(callback);
  },
};

// Language detection from file extension
export function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    rb: 'ruby',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    less: 'less',
    json: 'json',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    txt: 'plaintext',
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
    ps1: 'powershell',
    bat: 'batch',
    cmd: 'batch',
    sql: 'sql',
    graphql: 'graphql',
    gql: 'graphql',
    dockerfile: 'dockerfile',
    makefile: 'makefile',
    toml: 'ini',
    ini: 'ini',
    cfg: 'ini',
    conf: 'ini',
    vue: 'html',
    svelte: 'html',
    dart: 'dart',
    lua: 'lua',
    r: 'r',
    matlab: 'matlab',
    groovy: 'groovy',
    ex: 'elixir',
    exs: 'elixir',
    erl: 'erlang',
    hs: 'haskell',
    clj: 'clojure',
    tex: 'latex',
    bib: 'latex',
    pdf: 'plaintext',
    csv: 'plaintext',
    log: 'plaintext',
    env: 'plaintext',
    gitignore: 'plaintext',
    dockerignore: 'plaintext',
  };

  return languageMap[ext] || 'plaintext';
}

// Check if file is binary
export function isBinaryFile(filePath: string): boolean {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const binaryExtensions = [
    'png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'webp',
    'mp3', 'mp4', 'wav', 'avi', 'mov', 'wmv', 'flv', 'webm',
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'exe', 'dll', 'so', 'dylib',
    'ttf', 'otf', 'woff', 'woff2',
  ];
  return binaryExtensions.includes(ext);
}

// Auth
export const auth = {
  async register(email: string, password: string, displayName: string) {
    if (electronAPI) {
      return await electronAPI.authRegister(email, password, displayName);
    }
    return { success: false, error: 'Auth not available in web mode' };
  },

  async login(email: string, password: string) {
    if (electronAPI) {
      return await electronAPI.authLogin(email, password);
    }
    return { success: false, error: 'Auth not available in web mode' };
  },

  async verifyEmail(email: string, code: string) {
    if (electronAPI) {
      return await electronAPI.authVerifyEmail(email, code);
    }
    return { success: false, error: 'Auth not available in web mode' };
  },

  async resendVerification(email: string) {
    if (electronAPI) {
      return await electronAPI.authResendVerification(email);
    }
    return { success: false, error: 'Auth not available in web mode' };
  },

  async getUser(email: string) {
    if (electronAPI) {
      return await electronAPI.authGetUser(email);
    }
    return { success: false, error: 'Auth not available in web mode' };
  },

  async logout() {
    if (electronAPI) {
      return await electronAPI.authLogout();
    }
    return { success: true };
  },

  async githubLogin() {
    if (electronAPI) {
      return await electronAPI.authGithubLogin();
    }
    return { success: false, error: 'Auth not available in web mode' };
  }
};
