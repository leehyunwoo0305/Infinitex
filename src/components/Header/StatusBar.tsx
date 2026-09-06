import React from 'react';
import { VscSourceControl, VscBell, VscWarning, VscError } from 'react-icons/vsc';
import { useStore } from '../../store/useStore';

export const StatusBar: React.FC = () => {
  const { openTabs, activeTabId, workspacePath } = useStore();
  const activeTab = openTabs.find(tab => tab.id === activeTabId);
  
  const folderName = workspacePath ? workspacePath.split(/[/\\]/).pop() || workspacePath : 'No workspace';
  
  return (
    <div className="status-bar">
      <div className="status-item">
        <VscSourceControl />
        <span>{folderName}</span>
      </div>
      
      <div className="status-item">
        <VscWarning />
        <span>0</span>
        <VscError />
        <span>0</span>
      </div>
      
      <div style={{ flex: 1 }} />
      
      {activeTab && (
        <>
          <div className="status-item">
            <span>{activeTab.isModified ? 'Modified' : 'Saved'}</span>
          </div>
          <div className="status-item">
            <span>UTF-8</span>
          </div>
          <div className="status-item">
            <span>{activeTab.language || 'plaintext'}</span>
          </div>
        </>
      )}
      
      <div className="status-item">
        <VscBell />
      </div>
    </div>
  );
};
