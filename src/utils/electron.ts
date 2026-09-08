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

// Detect language from file content (for untitled/new files)
export function detectLanguageFromContent(content: string): string {
  if (!content || content.trim().length === 0) return 'plaintext';
  
  const trimmed = content.trim();
  
  // HTML detection
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('<?xml')) {
    return 'html';
  }
  
  // JSX/TSX detection
  if (trimmed.includes('import React') || trimmed.includes('from "react"') || trimmed.includes("from 'react'")) {
    if (trimmed.includes(': ') || trimmed.includes('interface ') || trimmed.includes('type ')) {
      return 'typescript';
    }
    return 'javascript';
  }
  
  // Vue detection
  if (trimmed.includes('<template>') || trimmed.includes('<script setup>')) {
    return 'html';
  }
  
  // Python detection
  if (trimmed.includes('def ') && trimmed.includes(':') && !trimmed.includes('{')) {
    return 'python';
  }
  if (trimmed.includes('import ') && (trimmed.includes('from ') || trimmed.includes('as '))) {
    if (trimmed.includes('print(') || trimmed.includes('def ') || trimmed.includes('class ')) {
      return 'python';
    }
  }
  
  // Java detection
  if (trimmed.includes('public class ') || trimmed.includes('public interface ')) {
    return 'java';
  }
  
  // C# detection
  if (trimmed.includes('using System') || trimmed.includes('namespace ') && trimmed.includes('class ')) {
    return 'csharp';
  }
  
  // C/C++ detection
  if (trimmed.includes('#include <') || trimmed.includes('#include "')) {
    if (trimmed.includes('cout') || trimmed.includes('cin') || trimmed.includes('std::')) {
      return 'cpp';
    }
    return 'c';
  }
  
  // Go detection
  if (trimmed.startsWith('package ') && trimmed.includes('func ')) {
    return 'go';
  }
  
  // Rust detection
  if (trimmed.includes('fn main()') || trimmed.includes('let mut ') || trimmed.includes('impl ')) {
    return 'rust';
  }
  
  // Ruby detection
  if (trimmed.includes('def ') && trimmed.includes('end') && !trimmed.includes('{')) {
    return 'ruby';
  }
  
  // PHP detection
  if (trimmed.startsWith('<?php')) {
    return 'php';
  }
  
  // Shell detection
  if (trimmed.startsWith('#!/bin/bash') || trimmed.startsWith('#!/bin/sh') || trimmed.startsWith('#!/usr/bin/env bash')) {
    return 'shell';
  }
  
  // SQL detection
  if (trimmed.match(/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i)) {
    return 'sql';
  }
  
  // JSON detection
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {}
  }
  
  // YAML detection
  if (trimmed.split('\n').some(line => line.match(/^[a-zA-Z_]+:\s/))) {
    return 'yaml';
  }
  
  // Markdown detection
  if (trimmed.startsWith('#') || trimmed.includes('**') || trimmed.includes('```')) {
    return 'markdown';
  }
  
  // CSS detection
  if (trimmed.includes('{') && trimmed.includes('}') && trimmed.includes(':') && !trimmed.includes('function')) {
    if (trimmed.match(/[.#][a-zA-Z]+\s*\{/)) {
      return 'css';
    }
  }
  
  // Dockerfile detection
  if (trimmed.startsWith('FROM ') || trimmed.includes('RUN ') || trimmed.includes('COPY ')) {
    return 'dockerfile';
  }
  
  return 'plaintext';
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
  async githubLogin() {
    if (electronAPI) {
      return await electronAPI.authGithubLogin();
    }
    return { success: false, error: 'Auth not available in web mode' };
  },

  async logout() {
    if (electronAPI) {
      return await electronAPI.authLogout();
    }
    return { success: true };
  }
};
