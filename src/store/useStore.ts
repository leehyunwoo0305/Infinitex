import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FileNode, Tab, Theme, ViewMode } from '../types';
import { fileSystem, detectLanguage, isBinaryFile } from '../utils/electron';

interface AppState {
  files: FileNode[];
  openTabs: Tab[];
  activeTabId: string | null;
  activeFile: string | null;
  activeTheme: Theme;
  viewMode: ViewMode;
  sidebarOpen: boolean;
  terminalOpen: boolean;
  gitPanelOpen: boolean;
  toolsOpen: boolean;
  workspacePath: string | null;
  authOpen: boolean;
  authMode: 'login' | 'signup';
  
  setFiles: (files: FileNode[]) => void;
  openFile: (file: FileNode) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  setTheme: (theme: Theme) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  toggleTerminal: () => void;
  toggleGitPanel: () => void;
  toggleTools: () => void;
  setWorkspacePath: (path: string) => void;
  setAuthOpen: (open: boolean, mode?: 'login' | 'signup') => void;
  loadWorkspace: (dirPath: string) => Promise<void>;
  loadChildren: (nodeId: string, dirPath: string) => Promise<void>;
  saveFile: (fileId: string) => Promise<void>;
  readFileContent: (fileId: string) => Promise<void>;
}

const defaultTheme: Theme = {
  id: 'dark',
  name: 'Dark',
  colors: {
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    sidebar: '#252526',
    editor: '#1e1e1e',
    terminal: '#1e1e1e',
    border: '#3c3c3c',
    accent: '#007acc',
  },
};

const initialFiles: FileNode[] = [
  {
    id: 'welcome',
    name: 'Welcome to Infinitex',
    type: 'file',
    language: 'markdown',
    content: '# Welcome to Infinitex!\n\nOpen a folder from the sidebar to start editing.',
  },
];

let fileIdCounter = 0;
const generateId = () => `file-${++fileIdCounter}-${Date.now()}`;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      files: initialFiles,
      openTabs: [],
      activeTabId: null,
      activeFile: null,
      activeTheme: defaultTheme,
      viewMode: 'editor',
      sidebarOpen: true,
      terminalOpen: true,
      gitPanelOpen: false,
      toolsOpen: false,
      workspacePath: null,
      authOpen: false,
      authMode: 'login',
  
  setFiles: (files) => set({ files }),
  
  openFile: (file) => set((state) => {
    const existingTab = state.openTabs.find(tab => tab.fileId === file.id);
    if (existingTab) {
      return { activeTabId: existingTab.id, activeFile: file.path || null };
    }
    
    const newTab: Tab = {
      id: `tab-${file.id}`,
      fileId: file.id,
      name: file.name,
      language: file.language || 'plaintext',
      isModified: false,
    };
    
    return {
      openTabs: [...state.openTabs, newTab],
      activeTabId: newTab.id,
      activeFile: file.path || null,
    };
  }),
  
  closeTab: (tabId) => set((state) => {
    const newTabs = state.openTabs.filter(tab => tab.id !== tabId);
    const newActiveTabId = state.activeTabId === tabId
      ? (newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null)
      : state.activeTabId;
    
    return {
      openTabs: newTabs,
      activeTabId: newActiveTabId,
    };
  }),
  
  setActiveTab: (tabId) => set({ activeTabId: tabId }),
  
  updateFileContent: (fileId, content) => set((state) => ({
    files: updateFileInTree(state.files, fileId, content),
    openTabs: state.openTabs.map(tab =>
      tab.fileId === fileId ? { ...tab, isModified: true } : tab
    ),
  })),
  
  setTheme: (theme) => set({ activeTheme: theme }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleTerminal: () => set((state) => ({ terminalOpen: !state.terminalOpen })),
  toggleGitPanel: () => set((state) => ({ gitPanelOpen: !state.gitPanelOpen })),
  toggleTools: () => set((state) => ({ toolsOpen: !state.toolsOpen })),
  setAuthOpen: (open, mode = 'login') => set({ authOpen: open, authMode: mode }),
  
  setWorkspacePath: (path) => set({ workspacePath: path }),
  
  loadWorkspace: async (dirPath: string) => {
    try {
      const items = await fileSystem.readDirectory(dirPath);
      const files: FileNode[] = items
        .filter(item => !item.name.startsWith('.'))
        .map(item => ({
          id: generateId(),
          name: item.name,
          type: item.type as 'file' | 'folder',
          path: item.path,
          language: item.type === 'file' ? detectLanguage(item.name) : undefined,
          isBinary: item.type === 'file' ? isBinaryFile(item.name) : undefined,
          children: item.type === 'folder' ? [] : undefined,
          isOpen: false,
        }));
      
      set({ files, workspacePath: dirPath });
    } catch (error) {
      console.error('Failed to load workspace:', error);
    }
  },
  
  loadChildren: async (nodeId: string, dirPath: string) => {
    try {
      const items = await fileSystem.readDirectory(dirPath);
      const children: FileNode[] = items
        .filter(item => !item.name.startsWith('.'))
        .map(item => ({
          id: generateId(),
          name: item.name,
          type: item.type as 'file' | 'folder',
          path: item.path,
          language: item.type === 'file' ? detectLanguage(item.name) : undefined,
          isBinary: item.type === 'file' ? isBinaryFile(item.name) : undefined,
          children: item.type === 'folder' ? [] : undefined,
          isOpen: false,
        }));
      
      set((state) => ({
        files: updateFileChildren(state.files, nodeId, children),
      }));
    } catch (error) {
      console.error('Failed to load children:', error);
    }
  },
  
  saveFile: async (fileId: string) => {
    const state = get();
    const file = findFileInTree(state.files, fileId);
    if (!file || !file.path || file.type === 'folder') return;
    
    try {
      await fileSystem.writeFile(file.path, file.content || '');
      set((state) => ({
        openTabs: state.openTabs.map(tab =>
          tab.fileId === fileId ? { ...tab, isModified: false } : tab
        ),
      }));
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  },
  
  readFileContent: async (fileId: string) => {
    const state = get();
    const file = findFileInTree(state.files, fileId);
    if (!file || !file.path || file.type === 'folder' || file.isBinary) return;
    
    try {
      const content = await fileSystem.readFile(file.path);
      set((state) => ({
        files: updateFileInTree(state.files, fileId, content),
      }));
    } catch (error) {
      console.error('Failed to read file:', error);
    }
  },
}),
    {
      name: 'infinitex-settings',
      partialize: (state) => ({
        activeTheme: state.activeTheme,
        viewMode: state.viewMode,
        sidebarOpen: state.sidebarOpen,
        terminalOpen: state.terminalOpen,
      }),
    }
  )
);

function updateFileInTree(files: FileNode[], fileId: string, content: string): FileNode[] {
  return files.map(file => {
    if (file.id === fileId) {
      return { ...file, content };
    }
    if (file.children) {
      return { ...file, children: updateFileInTree(file.children, fileId, content) };
    }
    return file;
  });
}

function updateFileChildren(files: FileNode[], nodeId: string, children: FileNode[]): FileNode[] {
  return files.map(file => {
    if (file.id === nodeId) {
      return { ...file, children, isOpen: true };
    }
    if (file.children) {
      return { ...file, children: updateFileChildren(file.children, nodeId, children) };
    }
    return file;
  });
}

function findFileInTree(files: FileNode[], fileId: string): FileNode | null {
  for (const file of files) {
    if (file.id === fileId) return file;
    if (file.children) {
      const found = findFileInTree(file.children, fileId);
      if (found) return found;
    }
  }
  return null;
}