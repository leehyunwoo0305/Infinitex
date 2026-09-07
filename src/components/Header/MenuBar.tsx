import React, { useState } from 'react';
import { 
  VscSplitHorizontal, 
  VscSplitVertical, 
  VscTerminal, 
  VscLayout, 
  VscLayoutSidebarLeft, 
  VscSourceControl, 
  VscSettingsGear,
  VscClose,
  VscChromeMinimize,
  VscChromeMaximize,
  VscChromeRestore,
  VscFile,
  VscSearch,
  VscBook,
  VscExtensions,
  VscDebugAlt,
  VscSettings,
  VscFilePdf,
  VscTools
} from 'react-icons/vsc';
import { useStore } from '../../store/useStore';
import { ThemeSettings } from '../Settings/ThemeSettings';
import { windowControls, isElectronApp, dialog, fileSystem, detectLanguage } from '../../utils/electron';

export const MenuBar: React.FC = () => {
  const { 
    viewMode, 
    setViewMode, 
    sidebarOpen, 
    toggleSidebar, 
    terminalOpen, 
    toggleTerminal,
    gitPanelOpen,
    toggleGitPanel,
    toolsOpen,
    toggleTools,
    setFiles,
    workspacePath
  } = useStore();
  
  const [themeSettingsOpen, setThemeSettingsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  React.useEffect(() => {
    if (!activeMenu) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.menu-item')) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [activeMenu]);
  
  const handleNewFile = async () => {
    if (!isElectronApp || !workspacePath) return;
    // Simple new file creation
    const fileName = prompt('Enter file name:');
    if (fileName) {
      const filePath = `${workspacePath}/${fileName}`;
      await fileSystem.writeFile(filePath, '');
      await useStore.getState().loadWorkspace(workspacePath);
    }
  };
  
  const handleOpenFile = async () => {
    if (!isElectronApp) return;
    const files = await dialog.openFile();
    if (files && files.length > 0) {
      for (const filePath of files) {
        const fileName = filePath.split(/[/\\]/).pop() || '';
        const content = await fileSystem.readFile(filePath);
        const newFile = {
          id: `file-${Date.now()}-${Math.random()}`,
          name: fileName,
          type: 'file' as const,
          path: filePath,
          language: detectLanguage(fileName),
          content,
        };
        useStore.getState().openFile(newFile);
      }
    }
  };
  
  const handleSaveFile = () => {
    const state = useStore.getState();
    if (state.activeTabId) {
      const tab = state.openTabs.find(t => t.id === state.activeTabId);
      if (tab) {
        state.saveFile(tab.fileId);
      }
    }
  };
  
  return (
    <>
      <div className="menu-bar">
        <div 
          className="menu-item"
          onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
          onMouseEnter={() => activeMenu && setActiveMenu('file')}
        >
          File
          {activeMenu === 'file' && (
            <div className="menu-dropdown">
              <div onClick={handleNewFile}>New File</div>
              <div onClick={handleOpenFile}>Open File</div>
              <div onClick={() => {
                dialog.openFolder().then(p => {
                  if (p) useStore.getState().loadWorkspace(p);
                });
              }}>Open Folder</div>
              <div className="menu-separator" />
              <div onClick={handleSaveFile}>Save</div>
              <div>Save As...</div>
              <div className="menu-separator" />
              <div>Preferences</div>
            </div>
          )}
        </div>
        <div 
          className="menu-item"
          onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
          onMouseEnter={() => activeMenu && setActiveMenu('edit')}
        >
          Edit
          {activeMenu === 'edit' && (
            <div className="menu-dropdown">
              <div>Undo</div>
              <div>Redo</div>
              <div className="menu-separator" />
              <div>Cut</div>
              <div>Copy</div>
              <div>Paste</div>
              <div className="menu-separator" />
              <div>Find</div>
              <div>Replace</div>
            </div>
          )}
        </div>
        <div 
          className="menu-item"
          onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
          onMouseEnter={() => activeMenu && setActiveMenu('view')}
        >
          View
          {activeMenu === 'view' && (
            <div className="menu-dropdown">
              <div onClick={toggleSidebar}>Toggle Sidebar</div>
              <div onClick={toggleTerminal}>Toggle Terminal</div>
              <div onClick={toggleGitPanel}>Source Control</div>
              <div className="menu-separator" />
              <div onClick={() => setViewMode('editor')}>Editor Only</div>
              <div onClick={() => setViewMode('split')}>Split View</div>
              <div onClick={() => setViewMode('preview')}>Preview Only</div>
            </div>
          )}
        </div>
        <div className="menu-item">Run</div>
        <div className="menu-item">Terminal</div>
        <div 
          className="menu-item"
          onClick={() => setActiveMenu(activeMenu === 'tools' ? null : 'tools')}
          onMouseEnter={() => activeMenu && setActiveMenu('tools')}
        >
          Tools
          {activeMenu === 'tools' && (
            <div className="menu-dropdown">
              <div onClick={toggleTools}>Developer Tools</div>
              <div className="menu-separator" />
              <div>JSON/YAML Editor</div>
              <div>Markdown Preview</div>
              <div>Regex Tester</div>
              <div>Snippet Manager</div>
              <div>Log Viewer</div>
              <div>API Client</div>
              <div>Package Manager</div>
              <div>Database Viewer</div>
              <div>Docker Manager</div>
              <div>File Converter</div>
              <div className="menu-separator" />
              <div>Minifier</div>
              <div>Encoder/Decoder</div>
              <div>Test Data Generator</div>
              <div>QR Code Generator</div>
              <div>Timer/Pomodoro</div>
              <div>ASCII Art</div>
              <div>Color Picker</div>
              <div>Calculator</div>
              <div>Network Tools</div>
            </div>
          )}
        </div>
        <div className="menu-item">Help</div>
        
        <div style={{ flex: 1 }} />
        
        <div className="toolbar">
          <button 
            className={`toolbar-button ${sidebarOpen ? 'active' : ''}`}
            onClick={toggleSidebar}
            title="Toggle Sidebar"
          >
            <VscLayoutSidebarLeft />
          </button>
          
          <button 
            className={`toolbar-button ${gitPanelOpen ? 'active' : ''}`}
            onClick={toggleGitPanel}
            title="Source Control"
          >
            <VscSourceControl />
          </button>
          
          <button 
            className={`toolbar-button ${viewMode === 'editor' ? 'active' : ''}`}
            onClick={() => setViewMode('editor')}
            title="Editor Only"
          >
            <VscLayout />
          </button>
          
          <button 
            className={`toolbar-button ${viewMode === 'split' ? 'active' : ''}`}
            onClick={() => setViewMode('split')}
            title="Split View"
          >
            <VscSplitHorizontal />
          </button>
          
          <button 
            className={`toolbar-button ${viewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setViewMode('preview')}
            title="Preview Only"
          >
            <VscSplitVertical />
          </button>
          
          <button 
            className={`toolbar-button ${terminalOpen ? 'active' : ''}`}
            onClick={toggleTerminal}
            title="Toggle Terminal"
          >
            <VscTerminal />
          </button>
          
          <button 
            className={`toolbar-button ${toolsOpen ? 'active' : ''}`}
            onClick={toggleTools}
            title="Developer Tools"
          >
            <VscTools />
          </button>
          
          <button 
            className="toolbar-button"
            onClick={() => setThemeSettingsOpen(true)}
            title="Theme Settings"
          >
            <VscSettingsGear />
          </button>
        </div>

        {isElectronApp && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
            <button 
              className="toolbar-button"
              onClick={windowControls.minimize}
              title="Minimize"
              style={{ width: '28px', height: '28px' }}
            >
              <VscChromeMinimize size={12} />
            </button>
            <button 
              className="toolbar-button"
              onClick={windowControls.maximize}
              title="Maximize"
              style={{ width: '28px', height: '28px' }}
            >
              <VscChromeMaximize size={12} />
            </button>
            <button 
              className="toolbar-button"
              onClick={windowControls.close}
              title="Close"
              style={{ width: '28px', height: '28px' }}
            >
              <VscClose size={12} />
            </button>
          </div>
        )}
      </div>
      
      <ThemeSettings 
        isOpen={themeSettingsOpen} 
        onClose={() => setThemeSettingsOpen(false)} 
      />
    </>
  );
};