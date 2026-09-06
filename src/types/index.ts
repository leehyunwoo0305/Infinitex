export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path?: string;
  content?: string;
  language?: string;
  isBinary?: boolean;
  children?: FileNode[];
  isOpen?: boolean;
}

export interface Tab {
  id: string;
  fileId: string;
  name: string;
  language: string;
  isModified: boolean;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    foreground: string;
    sidebar: string;
    editor: string;
    terminal: string;
    border: string;
    accent: string;
  };
}

export type ViewMode = 'split' | 'editor' | 'preview';