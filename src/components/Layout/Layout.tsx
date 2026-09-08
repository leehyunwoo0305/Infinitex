import React from 'react';
import { MenuBar } from '../Header/MenuBar';
import { StatusBar } from '../Header/StatusBar';
import { FileExplorer } from '../Sidebar/FileExplorer';
import { GitGUI } from '../Git/GitGUI';
import { CodeEditor } from '../Editor/CodeEditor';
import { Terminal } from '../Terminal/Terminal';
import { LivePreview } from '../Preview/LivePreview';
import { PDFViewer } from '../PDF/PDFViewer';
import { UpdateNotification } from '../Update/UpdateNotification';
import { ToolsPanel } from '../Tools/ToolsPanel';
import { useStore } from '../../store/useStore';
import '../../styles/global.scss';

export const Layout: React.FC = () => {
  const { sidebarOpen, terminalOpen, viewMode, gitPanelOpen, activeTheme, showPDF, pdfFile, closePDF } = useStore();
  
  const themeStyle = {
    '--bg-primary': activeTheme.colors.background,
    '--bg-secondary': activeTheme.colors.sidebar,
    '--bg-tertiary': activeTheme.colors.background,
    '--text-primary': activeTheme.colors.foreground,
    '--border-color': activeTheme.colors.border,
    '--accent-color': activeTheme.colors.accent,
  } as React.CSSProperties;
  
  return (
    <div className="app-container" style={themeStyle}>
      <MenuBar />
      
      <div className="main-content">
        {sidebarOpen && <FileExplorer />}
        {gitPanelOpen && <GitGUI />}
        
        <div className="editor-area">
          <div className="split-view">
            {showPDF ? (
              <PDFViewer file={pdfFile} onClose={closePDF} />
            ) : (
              <CodeEditor />
            )}
            
            {viewMode === 'split' && <LivePreview />}
          </div>
          
          {viewMode === 'preview' && <LivePreview />}
          
          {terminalOpen && <Terminal />}
        </div>
      </div>
      
      <StatusBar />
      <UpdateNotification />
      <ToolsPanel />
    </div>
  );
};
