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
    } else if (!file.isBinary) {
      onFileOpen(file);
    }
  };
  
  const getIcon = () => {
    if (file.type === 'folder') {
      return isOpen ? <VscFolderOpened /> : <VscFolder />;
    }
    return <VscFile />;
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
