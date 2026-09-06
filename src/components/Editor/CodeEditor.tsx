import React, { useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { VscClose } from 'react-icons/vsc';
import { useStore } from '../../store/useStore';

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
    <div className="editor-area" style={{ flex: 1 }}>
      <div className="tab-bar">
        {openTabs.map(tab => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? 'active' : ''} ${tab.isModified ? 'modified' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
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