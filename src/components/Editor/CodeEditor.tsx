import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { VscClose, VscCode, VscFileMedia, VscFilePdf, VscJson, VscMarkdown, VscTerminal, VscDatabase, VscNote, VscPaintcan, VscGlobe, VscSettingsGear, VscSymbolProperty, VscFileZip, VscFileBinary, VscTools } from 'react-icons/vsc';
import { useStore } from '../../store/useStore';
import { detectLanguageFromContent } from '../../utils/electron';

function getTabIcon(name: string): React.ReactNode {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  
  const iconMap: Record<string, React.ReactNode> = {
    // TypeScript/JavaScript
    ts: <VscCode size={12} color="#3178c6" />,
    tsx: <VscCode size={12} color="#3178c6" />,
    js: <VscCode size={12} color="#f7df1e" />,
    jsx: <VscCode size={12} color="#f7df1e" />,
    
    // Python
    py: <VscCode size={12} color="#3776ab" />,
    
    // Java
    java: <VscCode size={12} color="#ed8b00" />,
    
    // C/C++
    c: <VscCode size={12} color="#555555" />,
    cpp: <VscCode size={12} color="#555555" />,
    h: <VscCode size={12} color="#555555" />,
    
    // C#
    cs: <VscCode size={12} color="#68217a" />,
    
    // Go
    go: <VscCode size={12} color="#00add8" />,
    
    // Rust
    rs: <VscCode size={12} color="#dea584" />,
    
    // Ruby
    rb: <VscCode size={12} color="#cc342d" />,
    
    // PHP
    php: <VscCode size={12} color="#777bb4" />,
    
    // Swift
    swift: <VscCode size={12} color="#f05138" />,
    
    // Kotlin
    kt: <VscCode size={12} color="#7f52ff" />,
    
    // Dart
    dart: <VscCode size={12} color="#0175c2" />,
    
    // Web
    html: <VscGlobe size={12} color="#e34f26" />,
    htm: <VscGlobe size={12} color="#e34f26" />,
    css: <VscPaintcan size={12} color="#1572b6" />,
    scss: <VscPaintcan size={12} color="#cc6699" />,
    less: <VscPaintcan size={12} color="#1d365d" />,
    vue: <VscCode size={12} color="#42b883" />,
    svelte: <VscCode size={12} color="#ff3e00" />,
    
    // Config/Data
    json: <VscJson size={12} color="#f7df1e" />,
    xml: <VscFileMedia size={12} color="#f16529" />,
    yaml: <VscSettingsGear size={12} color="#cb171e" />,
    yml: <VscSettingsGear size={12} color="#cb171e" />,
    toml: <VscSettingsGear size={12} color="#9c4221" />,
    
    // Documentation
    md: <VscMarkdown size={12} color="#083fa1" />,
    mdx: <VscMarkdown size={12} color="#083fa1" />,
    
    // Shell
    sh: <VscTerminal size={12} color="#89e051" />,
    bash: <VscTerminal size={12} color="#89e051" />,
    zsh: <VscTerminal size={12} color="#89e051" />,
    ps1: <VscTerminal size={12} color="#012456" />,
    bat: <VscTerminal size={12} color="#c1f12e" />,
    
    // Database
    sql: <VscDatabase size={12} color="#336791" />,
    graphql: <VscDatabase size={12} color="#e10098" />,
    
    // Docker
    dockerfile: <VscTools size={12} color="#2496ed" />,
    
    // Text
    txt: <VscNote size={12} color="#898989" />,
    log: <VscNote size={12} color="#898989" />,
    
    // Binary
    pdf: <VscFilePdf size={12} color="#ff0000" />,
    zip: <VscFileZip size={12} color="#feb900" />,
    png: <VscFileMedia size={12} color="#a855f7" />,
    jpg: <VscFileMedia size={12} color="#a855f7" />,
    svg: <VscFileMedia size={12} color="#ffb13b" />,
  };
  
  return iconMap[ext] || <VscCode size={12} color="#898989" />;
}

export const CodeEditor: React.FC = () => {
  const { 
    openTabs, 
    activeTabId, 
    files, 
    setActiveTab, 
    closeTab, 
    updateFileContent,
    readFileContent,
    saveFile
  } = useStore();
  
  const activeTab = openTabs.find(tab => tab.id === activeTabId);
  const activeFile = activeTab ? files.find(file => file.id === activeTab.fileId) : null;
  
  // Load file content when tab changes
  useEffect(() => {
    if (activeFile && activeFile.path && !activeFile.content && !activeFile.isBinary) {
      readFileContent(activeFile.id);
    }
  }, [activeFile?.id]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeTab) {
          saveFile(activeTab.fileId);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, saveFile]);
  
  const handleEditorChange = (value: string | undefined) => {
    if (activeTab && value !== undefined) {
      updateFileContent(activeTab.fileId, value);
      // Auto-detect language from content for untitled files
      if (activeFile && activeFile.name.startsWith('untitled-')) {
        const detectedLang = detectLanguageFromContent(value);
        if (detectedLang !== 'plaintext' && detectedLang !== activeTab.language) {
          // Update tab language
          useStore.setState((state) => ({
            openTabs: state.openTabs.map(tab =>
              tab.id === activeTab.id ? { ...tab, language: detectedLang } : tab
            ),
          }));
        }
      }
    }
  };
  
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };
  
  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    closeTab(tabId);
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div className="tab-bar">
        {openTabs.map(tab => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? 'active' : ''} ${tab.isModified ? 'modified' : ''}`}
            onClick={() => handleTabClick(tab.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {getTabIcon(tab.name)}
            <span>{tab.name}</span>
            <span 
              className="tab-close"
              onClick={(e) => handleTabClose(e, tab.id)}
            >
              <VscClose />
            </span>
          </div>
        ))}
      </div>
      
      <div className="editor-container">
        {activeFile && !activeFile.isBinary ? (
          <Editor
            height="100%"
            language={activeTab?.language || 'plaintext'}
            value={activeFile.content || ''}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              formatOnPaste: true,
              formatOnType: true,
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true },
            }}
          />
        ) : activeFile?.isBinary ? (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <div>Binary file</div>
            <div style={{ fontSize: '12px', marginTop: '8px' }}>
              Cannot open binary file: {activeFile.name}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div>No file opened</div>
            <div style={{ fontSize: '12px', marginTop: '8px' }}>
              Select a file from the explorer to start editing
            </div>
          </div>
        )}
      </div>
    </div>
  );
};