import React, { useState, useEffect, useCallback } from 'react';
import {
  VscSourceControl,
  VscGitCommit,
  VscSync,
  VscAdd,
  VscRemove,
  VscDiffAdded,
  VscDiffModified,
  VscDiffRemoved,
  VscQuestion,
  VscCheck,
  VscArrowUp,
  VscArrowDown,
  VscRefresh
} from 'react-icons/vsc';
import { useStore } from '../../store/useStore';
import { isElectronApp, electronAPI } from '../../utils/electron';

interface GitFile {
  name: string;
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'untracked' | 'renamed';
  staged: boolean;
}

export const GitPanel: React.FC = () => {
  const { workspacePath } = useStore();
  const [files, setFiles] = useState<GitFile[]>([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [branch, setBranch] = useState('main');
  const [loading, setLoading] = useState(false);
  const [isRepo, setIsRepo] = useState(false);

  const stagedFiles = files.filter(f => f.staged);
  const unstagedFiles = files.filter(f => !f.staged);

  const checkGitRepo = useCallback(async () => {
    if (!workspacePath) return;
    const exists = await electronAPI?.exists(`${workspacePath}/.git`);
    setIsRepo(!!exists);
  }, [workspacePath]);

  const loadGitStatus = useCallback(async () => {
    if (!workspacePath || !isElectronApp || !electronAPI) return;

    setLoading(true);
    try {
      const [statusResult, branchResult] = await Promise.all([
        electronAPI.gitStatus(workspacePath),
        electronAPI.gitBranch(workspacePath),
      ]);

      if (branchResult.success && branchResult.branch) {
        setBranch(branchResult.branch);
      }

      if (statusResult.success && statusResult.files) {
        const gitFiles: GitFile[] = statusResult.files.map((f: any) => ({
          name: f.path.split('/').pop() || f.path,
          path: f.path,
          status: f.status as GitFile['status'],
          staged: f.indexStatus !== '?' && f.indexStatus !== ' ' && f.indexStatus !== '!',
        }));
        setFiles(gitFiles);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error('Failed to load git status:', error);
    } finally {
      setLoading(false);
    }
  }, [workspacePath, isElectronApp]);

  useEffect(() => {
    if (workspacePath && isElectronApp) {
      checkGitRepo();
      loadGitStatus();
    }
  }, [workspacePath, checkGitRepo, loadGitStatus]);

  const getStatusIcon = (status: GitFile['status']) => {
    switch (status) {
      case 'added': return <VscDiffAdded color="#4ec9b0" />;
      case 'modified': return <VscDiffModified color="#dcdcaa" />;
      case 'deleted': return <VscDiffRemoved color="#f44747" />;
      case 'untracked': return <VscQuestion color="#858585" />;
      case 'renamed': return <VscDiffModified color="#808080" />;
    }
  };

  const toggleStage = (filePath: string) => {
    setFiles(files.map(f =>
      f.path === filePath ? { ...f, staged: !f.staged } : f
    ));
  };

  const stageAll = () => {
    setFiles(files.map(f => ({ ...f, staged: true })));
  };

  const unstageAll = () => {
    setFiles(files.map(f => ({ ...f, staged: false })));
  };

  const handleCommit = async () => {
    if (!commitMessage || stagedFiles.length === 0 || !workspacePath || !electronAPI) return;

    setLoading(true);
    try {
      const result = await electronAPI.gitCommit(commitMessage, workspacePath);
      if (result.success) {
        setCommitMessage('');
        await loadGitStatus();
      }
    } catch (error) {
      console.error('Commit failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInit = async () => {
    if (!workspacePath || !electronAPI) return;
    await electronAPI.gitInit(workspacePath);
    await checkGitRepo();
    await loadGitStatus();
  };

  return (
    <div style={{
      width: '260px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <VscSourceControl />
        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>
          Source Control
        </span>
        <div style={{ flex: 1 }} />
        <button
          className="toolbar-button"
          onClick={loadGitStatus}
          disabled={loading}
          title="Refresh"
          style={{ width: '24px', height: '24px' }}
        >
          <VscRefresh size={12} />
        </button>
      </div>

      {!isRepo ? (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '12px',
        }}>
          <div style={{ marginBottom: '12px' }}>Not a git repository</div>
          <button
            onClick={handleInit}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--accent-color)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Initialize Git
          </button>
        </div>
      ) : (
        <>
          <div style={{
            padding: '12px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            gap: '8px',
          }}>
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCommit()}
              placeholder="Commit message"
              style={{
                flex: 1,
                padding: '6px 10px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              disabled={!commitMessage || stagedFiles.length === 0}
              onClick={handleCommit}
              style={{
                padding: '6px 12px',
                backgroundColor: commitMessage && stagedFiles.length > 0 ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                color: commitMessage && stagedFiles.length > 0 ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '4px',
                cursor: commitMessage && stagedFiles.length > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <VscGitCommit />
              Commit
            </button>
          </div>

          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            gap: '4px',
          }}>
            <button style={toolBtnStyle} title="Sync Changes"><VscSync /></button>
            <button style={toolBtnStyle} title="Push"><VscArrowUp /></button>
            <button style={toolBtnStyle} title="Pull"><VscArrowDown /></button>
            <div style={{ flex: 1 }} />
            <button style={toolBtnStyle} title="Stage All" onClick={stageAll}><VscAdd /></button>
            <button style={toolBtnStyle} title="Unstage All" onClick={unstageAll}><VscRemove /></button>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }} className="scrollbar">
            {stagedFiles.length > 0 && (
              <div>
                <div style={sectionHeaderStyle}>
                  <span>Staged Changes</span>
                  <span>{stagedFiles.length}</span>
                </div>
                {stagedFiles.map(file => (
                  <div
                    key={file.path}
                    style={fileItemStyle}
                    onClick={() => toggleStage(file.path)}
                  >
                    <span style={{ marginRight: '8px' }}>{getStatusIcon(file.status)}</span>
                    <span style={{ flex: 1, fontSize: '13px' }}>{file.name}</span>
                    <VscCheck color="#4ec9b0" />
                  </div>
                ))}
              </div>
            )}

            {unstagedFiles.length > 0 && (
              <div>
                <div style={sectionHeaderStyle}>
                  <span>Changes</span>
                  <span>{unstagedFiles.length}</span>
                </div>
                {unstagedFiles.map(file => (
                  <div
                    key={file.path}
                    style={fileItemStyle}
                    onClick={() => toggleStage(file.path)}
                  >
                    <span style={{ marginRight: '8px' }}>{getStatusIcon(file.status)}</span>
                    <span style={{ flex: 1, fontSize: '13px' }}>{file.name}</span>
                  </div>
                ))}
              </div>
            )}

            {files.length === 0 && !loading && (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '12px',
              }}>
                No changes detected
              </div>
            )}
          </div>

          <div style={{
            padding: '12px',
            borderTop: '1px solid var(--border-color)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{branch}</span>
              <span>{stagedFiles.length} staged</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const toolBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  border: 'none',
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  borderRadius: '4px',
};

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: 'var(--text-secondary)',
  backgroundColor: 'var(--bg-tertiary)',
};

const fileItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: '13px',
};
