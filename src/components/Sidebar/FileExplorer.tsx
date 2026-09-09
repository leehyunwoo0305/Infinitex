import { useState, useMemo } from 'react';
import {
  VscChevronRight,
  VscChevronDown,
  VscFile,
  VscFolder,
  VscFolderOpened,
  VscRefresh,
  VscClose,
  VscSearch,
  VscSignIn,
  VscSignOut,
  VscPerson,
  VscCode,
  VscFileMedia,
  VscFilePdf,
  VscFileZip,
  VscFileBinary,
  VscSymbolProperty,
  VscNote,
  VscTerminal,
  VscTools,
  VscDatabase,
  VscGlobe,
  VscJson,
  VscMarkdown,
  VscSettingsGear,
  VscPaintcan,
} from 'react-icons/vsc';
import type { FileNode } from '../../types';
import { useStore } from '../../store/useStore';
import { fileSystem, dialog, isElectronApp } from '../../utils/electron';
import { useAuth } from '../../contexts/AuthContext';

function filterTree(nodes: FileNode[], query: string): FileNode[] {
  if (!query) return nodes;
  const lower = query.toLowerCase();
  
  return nodes.reduce<FileNode[]>((acc, node) => {
    if (node.name.toLowerCase().includes(lower)) {
      acc.push(node);
    } else if (node.children) {
      const filtered = filterTree(node.children, query);
      if (filtered.length > 0) {
        acc.push({ ...node, children: filtered, isOpen: true });
      }
    }
    return acc;
  }, []);
}

function getFileIcon(name: string): React.ReactNode {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  
  // Language-specific icons with brand colors
  const iconMap: Record<string, React.ReactNode> = {
    // TypeScript/JavaScript
    ts: <VscCode size={14} color="#3178c6" />,
    tsx: <VscCode size={14} color="#3178c6" />,
    js: <VscCode size={14} color="#f7df1e" />,
    jsx: <VscCode size={14} color="#f7df1e" />,
    mjs: <VscCode size={14} color="#f7df1e" />,
    cjs: <VscCode size={14} color="#f7df1e" />,
    
    // Python
    py: <VscCode size={14} color="#3776ab" />,
    pyw: <VscCode size={14} color="#3776ab" />,
    
    // Java
    java: <VscCode size={14} color="#ed8b00" />,
    
    // C/C++
    c: <VscCode size={14} color="#555555" />,
    cpp: <VscCode size={14} color="#555555" />,
    h: <VscCode size={14} color="#555555" />,
    hpp: <VscCode size={14} color="#555555" />,
    cc: <VscCode size={14} color="#555555" />,
    cxx: <VscCode size={14} color="#555555" />,
    
    // C#
    cs: <VscCode size={14} color="#68217a" />,
    
    // Go
    go: <VscCode size={14} color="#00add8" />,
    
    // Rust
    rs: <VscCode size={14} color="#dea584" />,
    
    // Ruby
    rb: <VscCode size={14} color="#cc342d" />,
    erb: <VscCode size={14} color="#cc342d" />,
    
    // PHP
    php: <VscCode size={14} color="#777bb4" />,
    
    // Swift
    swift: <VscCode size={14} color="#f05138" />,
    
    // Kotlin
    kt: <VscCode size={14} color="#7f52ff" />,
    kts: <VscCode size={14} color="#7f52ff" />,
    
    // Scala
    scala: <VscCode size={14} color="#dc322f" />,
    sc: <VscCode size={14} color="#dc322f" />,
    
    // Dart
    dart: <VscCode size={14} color="#0175c2" />,
    
    // Lua
    lua: <VscCode size={14} color="#000080" />,
    
    // R
    r: <VscCode size={14} color="#276dc3" />,
    rmd: <VscCode size={14} color="#276dc3" />,
    
    // Perl
    pl: <VscCode size={14} color="#39457e" />,
    pm: <VscCode size={14} color="#39457e" />,
    
    // Elixir
    ex: <VscCode size={14} color="#6e4a7e" />,
    exs: <VscCode size={14} color="#6e4a7e" />,
    
    // Haskell
    hs: <VscCode size={14} color="#5e5086" />,
    
    // Clojure
    clj: <VscCode size={14} color="#5881d8" />,
    cljs: <VscCode size={14} color="#5881d8" />,
    
    // Erlang
    erl: <VscCode size={14} color="#a90533" />,
    
    // Web
    html: <VscGlobe size={14} color="#e34f26" />,
    htm: <VscGlobe size={14} color="#e34f26" />,
    css: <VscPaintcan size={14} color="#1572b6" />,
    scss: <VscPaintcan size={14} color="#cc6699" />,
    sass: <VscPaintcan size={14} color="#cc6699" />,
    less: <VscPaintcan size={14} color="#1d365d" />,
    vue: <VscCode size={14} color="#42b883" />,
    svelte: <VscCode size={14} color="#ff3e00" />,
    
    // Config/Data
    json: <VscJson size={14} color="#f7df1e" />,
    jsonc: <VscJson size={14} color="#f7df1e" />,
    xml: <VscFileMedia size={14} color="#f16529" />,
    yaml: <VscSettingsGear size={14} color="#cb171e" />,
    yml: <VscSettingsGear size={14} color="#cb171e" />,
    toml: <VscSettingsGear size={14} color="#9c4221" />,
    ini: <VscSettingsGear size={14} color="#9c4221" />,
    cfg: <VscSettingsGear size={14} color="#9c4221" />,
    conf: <VscSettingsGear size={14} color="#9c4221" />,
    
    // Documentation
    md: <VscMarkdown size={14} color="#083fa1" />,
    mdx: <VscMarkdown size={14} color="#083fa1" />,
    rst: <VscMarkdown size={14} color="#083fa1" />,
    
    // Shell/Terminal
    sh: <VscTerminal size={14} color="#89e051" />,
    bash: <VscTerminal size={14} color="#89e051" />,
    zsh: <VscTerminal size={14} color="#89e051" />,
    fish: <VscTerminal size={14} color="#89e051" />,
    ps1: <VscTerminal size={14} color="#012456" />,
    bat: <VscTerminal size={14} color="#c1f12e" />,
    cmd: <VscTerminal size={14} color="#c1f12e" />,
    
    // Database
    sql: <VscDatabase size={14} color="#336791" />,
    graphql: <VscDatabase size={14} color="#e10098" />,
    gql: <VscDatabase size={14} color="#e10098" />,
    
    // Docker/DevOps
    dockerfile: <VscTools size={14} color="#2496ed" />,
    dockerignore: <VscTools size={14} color="#2496ed" />,
    makefile: <VscTools size={14} color="#427819" />,
    cmake: <VscTools size={14} color="#427819" />,
    
    // Build/Package
    txt: <VscNote size={14} color="#898989" />,
    log: <VscNote size={14} color="#898989" />,
    env: <VscSymbolProperty size={14} color="#ecd53f" />,
    gitignore: <VscSymbolProperty size={14} color="#f05032" />,
    editorconfig: <VscSymbolProperty size={14} color="#f05032" />,
    
    // Binary/Archive
    pdf: <VscFilePdf size={14} color="#ff0000" />,
    zip: <VscFileZip size={14} color="#feb900" />,
    rar: <VscFileZip size={14} color="#feb900" />,
    '7z': <VscFileZip size={14} color="#feb900" />,
    tar: <VscFileZip size={14} color="#feb900" />,
    gz: <VscFileZip size={14} color="#feb900" />,
    
    // Images
    png: <VscFileMedia size={14} color="#a855f7" />,
    jpg: <VscFileMedia size={14} color="#a855f7" />,
    jpeg: <VscFileMedia size={14} color="#a855f7" />,
    gif: <VscFileMedia size={14} color="#a855f7" />,
    svg: <VscFileMedia size={14} color="#ffb13b" />,
    webp: <VscFileMedia size={14} color="#a855f7" />,
    ico: <VscFileMedia size={14} color="#a855f7" />,
    bmp: <VscFileMedia size={14} color="#a855f7" />,
    
    // Binary
    exe: <VscFileBinary size={14} color="#6b7280" />,
    dll: <VscFileBinary size={14} color="#6b7280" />,
    so: <VscFileBinary size={14} color="#6b7280" />,
    dylib: <VscFileBinary size={14} color="#6b7280" />,
  };
  
  return iconMap[ext] || <VscFile size={14} color="#898989" />;
}

export const FileExplorer: React.FC = () => {
  const { files, openFile, sidebarOpen, loadWorkspace, workspacePath, setAuthOpen } = useStore();
  const { user, logout, loginGithub } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredFiles = useMemo(() => filterTree(files, searchQuery), [files, searchQuery]);
  
  if (!sidebarOpen) return null;
  
  const handleOpenFolder = async () => {
    if (!isElectronApp) return;
    const folderPath = await dialog.openFolder();
    if (folderPath) {
      await loadWorkspace(folderPath);
    }
  };
  
  const handleRefresh = async () => {
    if (workspacePath) {
      await loadWorkspace(workspacePath);
    }
  };
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">
          {workspacePath ? workspacePath.split(/[/\\]/).pop() || 'Explorer' : 'Explorer'}
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="toolbar-button" title="Open Folder" onClick={handleOpenFolder}>
            <VscFolder />
          </button>
          <button className="toolbar-button" title="Refresh" onClick={handleRefresh}>
            <VscRefresh />
          </button>
        </div>
      </div>
      
      {workspacePath && (
        <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '4px 8px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '4px',
          }}>
            <VscSearch size={14} color="var(--text-secondary)" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: '2px',
                }}
              >
                <VscClose size={14} />
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className="file-tree scrollbar">
        {!workspacePath ? (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            color: 'var(--text-secondary)',
            fontSize: '12px',
          }}>
            <VscFolder size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <div>No folder opened</div>
            <button
              onClick={handleOpenFolder}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                backgroundColor: 'var(--accent-color)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Open Folder
            </button>
          </div>
        ) : filteredFiles.length === 0 && searchQuery ? (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            color: 'var(--text-secondary)',
            fontSize: '12px',
          }}>
            No matching files
          </div>
        ) : (
          filteredFiles.map(file => (
            <TreeNode key={file.id} file={file} onFileOpen={openFile} />
          ))
        )}
      </div>
      
      <div style={{ 
        marginTop: 'auto',
        borderTop: '1px solid var(--border-color)',
        padding: '8px 12px',
      }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #007acc 0%, #005fa3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              flexShrink: 0,
            }}>
              {user.avatar ? (
                <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                (user.displayName || user.email || '?')[0].toUpperCase()
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontSize: '12px', 
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user.displayName || user.email?.split('@')[0]}
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user.email}
              </div>
            </div>
            <button 
              className="toolbar-button"
              onClick={logout}
              title="Logout"
              style={{ width: '24px', height: '24px', flexShrink: 0 }}
            >
              <VscSignOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAuthOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px',
              backgroundColor: 'var(--accent-color)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
            }}
          >
            <VscSignIn size={14} />
            GitHub로 로그인
          </button>
        )}
      </div>
    </div>
  );
};

interface TreeNodeProps {
  file: FileNode;
  onFileOpen: (file: FileNode) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ file, onFileOpen }) => {
  const [isOpen, setIsOpen] = useState(file.isOpen ?? false);
  const { activeTabId, openTabs, loadChildren } = useStore();
  
  const isActive = openTabs.some(tab => tab.fileId === file.id && tab.id === activeTabId);
  
  const handleClick = async () => {
    if (file.type === 'folder') {
      if (!isOpen && file.path) {
        await loadChildren(file.id, file.path);
      }
      setIsOpen(!isOpen);
    } else {
      onFileOpen(file);
    }
  };
  
  const getIcon = () => {
    if (file.type === 'folder') {
      return isOpen ? <VscFolderOpened /> : <VscFolder />;
    }
    return getFileIcon(file.name);
  };
  
  return (
    <div>
      <div 
        className={`tree-item ${isActive ? 'active' : ''}`}
        onClick={handleClick}
      >
        {file.type === 'folder' && (
          <span className="tree-icon">
            {isOpen ? <VscChevronDown /> : <VscChevronRight />}
          </span>
        )}
        <span className="tree-icon">{getIcon()}</span>
        <span>{file.name}</span>
      </div>
      
      {file.type === 'folder' && isOpen && file.children && (
        <div className="tree-children">
          {file.children.map(child => (
            <TreeNode key={child.id} file={child} onFileOpen={onFileOpen} />
          ))}
        </div>
      )}
    </div>
  );
};
