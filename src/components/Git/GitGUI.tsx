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
  VscRefresh,
  VscGitBranch,
  VscHistory,
  VscArchive,
  VscWarning,
  VscClose,
  VscTrash,
  VscChevronRight,
  VscChevronDown
} from 'react-icons/vsc';
import { useStore } from '../../store/useStore';
import { isElectronApp, electronAPI } from '../../utils/electron';

interface GitFile {
  name: string;
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'untracked' | 'renamed';
  staged: boolean;
}

interface GitCommit {
  hash: string;
  subject: string;
  author: string;
  date: string;
}

interface GitBranch {
  name: string;
  isCurrent: boolean;
}

interface GitStash {
  ref: string;
  message: string;
  hash: string;
}

type GitTab = 'changes' | 'log' | 'branches' | 'stash';

export const GitGUI: React.FC = () => {
  const { workspacePath } = useStore();
  const [activeTab, setActiveTab] = useState<GitTab>('changes');
  const [files, setFiles] = useState<GitFile[]>([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [branch, setBranch] = useState('main');
  const [loading, setLoading] = useState(false);
  const [isRepo, setIsRepo] = useState(false);
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [branches, setBranches] = useState<GitBranch[]>([]);
  const [stashes, setStashes] = useState<GitStash[]>([]);
  const [newBranchName, setNewBranchName] = useState('');
  const [stashMessage, setStashMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    staged: true,
    unstaged: true,
    stash: true
  });

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

  const loadGitLog = useCallback(async () => {
    if (!workspacePath || !isElectronApp || !electronAPI) return;

    try {
      const result = await electronAPI.gitLog(workspacePath, 20);
      if (result.success && result.entries) {
        setCommits(result.entries);
      }
    } catch (error) {
      console.error('Failed to load git log:', error);
    }
  }, [workspacePath, isElectronApp]);

  const loadGitBranches = useCallback(async () => {
    if (!workspacePath || !isElectronApp || !electronAPI) return;

    try {
      const result = await electronAPI.gitBranchList(workspacePath);
      if (result.success && result.branches) {
        setBranches(result.branches);
      }
    } catch (error) {
      console.error('Failed to load git branches:', error);
    }
  }, [workspacePath, isElectronApp]);

  const loadGitStashes = useCallback(async () => {
    if (!workspacePath || !isElectronApp || !electronAPI) return;

    try {
      const result = await electronAPI.gitStashList(workspacePath);
      if (result.success && result.stashes) {
        setStashes(result.stashes);
      }
    } catch (error) {
      console.error('Failed to load git stashes:', error);
    }
  }, [workspacePath, isElectronApp]);

  useEffect(() => {
    if (workspacePath && isElectronApp) {
      checkGitRepo();
      loadGitStatus();
      loadGitLog();
      loadGitBranches();
      loadGitStashes();
    }
  }, [workspacePath, checkGitRepo, loadGitStatus, loadGitLog, loadGitBranches, loadGitStashes]);

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
        await loadGitLog();
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

  const handleCreateBranch = async () => {
    if (!newBranchName || !workspacePath || !electronAPI) return;
    await electronAPI.gitBranchCreate(newBranchName, workspacePath);
    setNewBranchName('');
    await loadGitBranches();
  };

  const handleDeleteBranch = async (branchName: string) => {
    if (!workspacePath || !electronAPI) return;
    await electronAPI.gitBranchDelete(branchName, workspacePath);
    await loadGitBranches();
  };

  const handleSwitchBranch = async (branchName: string) => {
    if (!workspacePath || !electronAPI) return;
    await electronAPI.gitBranchSwitch(branchName, workspacePath);
    await loadGitBranches();
    await loadGitStatus();
  };

  const handleStash = async () => {
    if (!workspacePath || !electronAPI) return;
    await electronAPI.gitStash(stashMessage, workspacePath);
    setStashMessage('');
    await loadGitStashes();
    await loadGitStatus();
  };

  const handleStashPop = async () => {
    if (!workspacePath || !electronAPI) return;
    await electronAPI.gitStashPop(workspacePath);
    await loadGitStashes();
    await loadGitStatus();
  };

  const handleStashDrop = async (ref: string) => {
    if (!workspacePath || !electronAPI) return;
    await electronAPI.gitStashDrop(ref, workspacePath);
    await loadGitStashes();
  };

  const handlePull = async () => {
    if (!workspacePath || !electronAPI) return;
    setLoading(true);
    try {
      await electronAPI.gitPull(workspacePath);
      await loadGitStatus();
      await loadGitLog();
    } finally {
      setLoading(false);
    }
  };

  const handlePush = async () => {
    if (!workspacePath || !electronAPI) return;
    setLoading(true);
    try {
      await electronAPI.gitPush(workspacePath);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!isRepo) {
    return (
      <div style={{
        width: '300px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <VscSourceControl size={48} color="var(--text-secondary)" />
        <div style={{ marginTop: '16px', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Not a git repository
        </div>
        <button
          onClick={handleInit}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: 'var(--accent-color)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Initialize Git
        </button>
      </div>
    );
  }

  return (
    <div style={{
      width: '300px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Tab Headers */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
      }}>
        {[
          { id: 'changes', icon: <VscSourceControl size={14} />, label: 'Changes' },
          { id: 'log', icon: <VscHistory size={14} />, label: 'Log' },
          { id: 'branches', icon: <VscGitBranch size={14} />, label: 'Branches' },
          { id: 'stash', icon: <VscArchive size={14} />, label: 'Stash' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as GitTab)}
            style={{
              flex: 1,
              padding: '8px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-color)' : '2px solid transparent',
              backgroundColor: activeTab === tab.id ? 'var(--bg-tertiary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '10px',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'auto' }} className="scrollbar">
        {activeTab === 'changes' && (
          <ChangesTab
            files={files}
            stagedFiles={stagedFiles}
            unstagedFiles={unstagedFiles}
            commitMessage={commitMessage}
            setCommitMessage={setCommitMessage}
            loading={loading}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            toggleStage={toggleStage}
            stageAll={stageAll}
            unstageAll={unstageAll}
            handleCommit={handleCommit}
            handlePull={handlePull}
            handlePush={handlePush}
            getStatusIcon={getStatusIcon}
          />
        )}

        {activeTab === 'log' && (
          <LogTab commits={commits} />
        )}

        {activeTab === 'branches' && (
          <BranchesTab
            branches={branches}
            branch={branch}
            newBranchName={newBranchName}
            setNewBranchName={setNewBranchName}
            handleCreateBranch={handleCreateBranch}
            handleDeleteBranch={handleDeleteBranch}
            handleSwitchBranch={handleSwitchBranch}
          />
        )}

        {activeTab === 'stash' && (
          <StashTab
            stashes={stashes}
            stashMessage={stashMessage}
            setStashMessage={setStashMessage}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            handleStash={handleStash}
            handleStashPop={handleStashPop}
            handleStashDrop={handleStashDrop}
          />
        )}
      </div>

      {/* Status Bar */}
      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid var(--border-color)',
        fontSize: '11px',
        color: 'var(--text-secondary)',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>{branch}</span>
        <span>{stagedFiles.length} staged</span>
      </div>
    </div>
  );
};

// Changes Tab Component
const ChangesTab: React.FC<{
  files: GitFile[];
  stagedFiles: GitFile[];
  unstagedFiles: GitFile[];
  commitMessage: string;
  setCommitMessage: (msg: string) => void;
  loading: boolean;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
  toggleStage: (path: string) => void;
  stageAll: () => void;
  unstageAll: () => void;
  handleCommit: () => void;
  handlePull: () => void;
  handlePush: () => void;
  getStatusIcon: (status: GitFile['status']) => React.ReactNode;
}> = ({
  stagedFiles, unstagedFiles, commitMessage, setCommitMessage, loading,
  expandedSections, toggleSection, toggleStage, stageAll, unstageAll,
  handleCommit, handlePull, handlePush, getStatusIcon
}) => (
  <>
    {/* Commit Input */}
    <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
      <input
        type="text"
        value={commitMessage}
        onChange={(e) => setCommitMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleCommit()}
        placeholder="Commit message"
        style={{
          width: '100%',
          padding: '8px',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          color: 'var(--text-primary)',
          fontSize: '13px',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          disabled={!commitMessage || stagedFiles.length === 0}
          onClick={handleCommit}
          style={{
            flex: 1,
            padding: '6px 12px',
            backgroundColor: commitMessage && stagedFiles.length > 0 ? 'var(--accent-color)' : 'var(--bg-tertiary)',
            color: commitMessage && stagedFiles.length > 0 ? 'white' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '4px',
            cursor: commitMessage && stagedFiles.length > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <VscGitCommit />
          Commit
        </button>
      </div>
    </div>

    {/* Toolbar */}
    <div style={{
      padding: '8px 12px',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      gap: '4px',
    }}>
      <button style={toolBtnStyle} title="Sync Changes" onClick={handlePull}><VscSync /></button>
      <button style={toolBtnStyle} title="Push" onClick={handlePush}><VscArrowUp /></button>
      <button style={toolBtnStyle} title="Pull" onClick={handlePull}><VscArrowDown /></button>
      <div style={{ flex: 1 }} />
      <button style={toolBtnStyle} title="Stage All" onClick={stageAll}><VscAdd /></button>
      <button style={toolBtnStyle} title="Unstage All" onClick={unstageAll}><VscRemove /></button>
    </div>

    {/* Staged Changes */}
    <div>
      <div
        style={sectionHeaderStyle}
        onClick={() => toggleSection('staged')}
      >
        {expandedSections.staged ? <VscChevronDown size={12} /> : <VscChevronRight size={12} />}
        <span style={{ marginLeft: '4px' }}>Staged Changes</span>
        <span>{stagedFiles.length}</span>
      </div>
      {expandedSections.staged && stagedFiles.map(file => (
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

    {/* Unstaged Changes */}
    <div>
      <div
        style={sectionHeaderStyle}
        onClick={() => toggleSection('unstaged')}
      >
        {expandedSections.unstaged ? <VscChevronDown size={12} /> : <VscChevronRight size={12} />}
        <span style={{ marginLeft: '4px' }}>Changes</span>
        <span>{unstagedFiles.length}</span>
      </div>
      {expandedSections.unstaged && unstagedFiles.map(file => (
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

    {/* Empty State */}
    {stagedFiles.length === 0 && unstagedFiles.length === 0 && !loading && (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '12px',
      }}>
        <VscCheck size={24} color="var(--text-secondary)" />
        <div style={{ marginTop: '8px' }}>No changes detected</div>
      </div>
    )}
  </>
);

// Log Tab Component
const LogTab: React.FC<{ commits: GitCommit[] }> = ({ commits }) => (
  <div style={{ padding: '12px' }}>
    {commits.length === 0 ? (
      <div style={{
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '12px',
        padding: '40px 20px',
      }}>
        No commits yet
      </div>
    ) : (
      commits.map((commit, index) => (
        <div
          key={commit.hash}
          style={{
            padding: '8px',
            marginBottom: '8px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '4px',
            borderLeft: '3px solid var(--accent-color)',
          }}
        >
          <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {commit.subject}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span style={{ marginRight: '8px' }}>{commit.author}</span>
            <span>{new Date(commit.date).toLocaleDateString()}</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', fontFamily: 'monospace' }}>
            {commit.hash.substring(0, 7)}
          </div>
        </div>
      ))
    )}
  </div>
);

// Branches Tab Component
const BranchesTab: React.FC<{
  branches: GitBranch[];
  branch: string;
  newBranchName: string;
  setNewBranchName: (name: string) => void;
  handleCreateBranch: () => void;
  handleDeleteBranch: (name: string) => void;
  handleSwitchBranch: (name: string) => void;
}> = ({
  branches, branch, newBranchName, setNewBranchName,
  handleCreateBranch, handleDeleteBranch, handleSwitchBranch
}) => (
  <div style={{ padding: '12px' }}>
    {/* Create Branch */}
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
      <input
        type="text"
        value={newBranchName}
        onChange={(e) => setNewBranchName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleCreateBranch()}
        placeholder="New branch name"
        style={{
          flex: 1,
          padding: '6px 8px',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          color: 'var(--text-primary)',
          fontSize: '12px',
          outline: 'none',
        }}
      />
      <button
        disabled={!newBranchName}
        onClick={handleCreateBranch}
        style={{
          padding: '6px 12px',
          backgroundColor: newBranchName ? 'var(--accent-color)' : 'var(--bg-tertiary)',
          color: newBranchName ? 'white' : 'var(--text-secondary)',
          border: 'none',
          borderRadius: '4px',
          cursor: newBranchName ? 'pointer' : 'not-allowed',
        }}
      >
        <VscAdd />
      </button>
    </div>

    {/* Branch List */}
    {branches.length === 0 ? (
      <div style={{
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '12px',
        padding: '40px 20px',
      }}>
        No branches found
      </div>
    ) : (
      branches.map((b) => (
        <div
          key={b.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            marginBottom: '4px',
            backgroundColor: b.isCurrent ? 'var(--bg-tertiary)' : 'transparent',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          onClick={() => !b.isCurrent && handleSwitchBranch(b.name)}
        >
          <VscGitBranch
            size={14}
            color={b.isCurrent ? 'var(--accent-color)' : 'var(--text-secondary)'}
            style={{ marginRight: '8px' }}
          />
          <span style={{
            flex: 1,
            fontSize: '13px',
            color: b.isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: b.isCurrent ? 'bold' : 'normal',
          }}>
            {b.name}
          </span>
          {b.isCurrent && <VscCheck size={12} color="var(--accent-color)" />}
          {!b.isCurrent && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteBranch(b.name);
              }}
              style={{
                padding: '2px 4px',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <VscTrash size={12} />
            </button>
          )}
        </div>
      ))
    )}
  </div>
);

// Stash Tab Component
const StashTab: React.FC<{
  stashes: GitStash[];
  stashMessage: string;
  setStashMessage: (msg: string) => void;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
  handleStash: () => void;
  handleStashPop: () => void;
  handleStashDrop: (ref: string) => void;
}> = ({
  stashes, stashMessage, setStashMessage, expandedSections, toggleSection,
  handleStash, handleStashPop, handleStashDrop
}) => (
  <div style={{ padding: '12px' }}>
    {/* Stash Input */}
    <div style={{ marginBottom: '16px' }}>
      <input
        type="text"
        value={stashMessage}
        onChange={(e) => setStashMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleStash()}
        placeholder="Stash message (optional)"
        style={{
          width: '100%',
          padding: '8px',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          color: 'var(--text-primary)',
          fontSize: '13px',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          onClick={handleStash}
          style={{
            flex: 1,
            padding: '6px 12px',
            backgroundColor: 'var(--accent-color)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Stash Changes
        </button>
        <button
          disabled={stashes.length === 0}
          onClick={handleStashPop}
          style={{
            padding: '6px 12px',
            backgroundColor: stashes.length > 0 ? 'var(--bg-tertiary)' : 'var(--bg-tertiary)',
            color: stashes.length > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            cursor: stashes.length > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          Pop
        </button>
      </div>
    </div>

    {/* Stash List */}
    <div
      style={sectionHeaderStyle}
      onClick={() => toggleSection('stash')}
    >
      {expandedSections.stash ? <VscChevronDown size={12} /> : <VscChevronRight size={12} />}
      <span style={{ marginLeft: '4px' }}>Stashes</span>
      <span>{stashes.length}</span>
    </div>
    {expandedSections.stash && (
      stashes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '12px',
          padding: '40px 20px',
        }}>
          No stashes
        </div>
      ) : (
        stashes.map((stash) => (
          <div
            key={stash.ref}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              marginBottom: '4px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '4px',
            }}
          >
            <VscArchive size={14} color="var(--text-secondary)" style={{ marginRight: '8px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {stash.message || 'No message'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                {stash.ref}
              </div>
            </div>
            <button
              onClick={() => handleStashDrop(stash.ref)}
              style={{
                padding: '2px 4px',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <VscTrash size={12} />
            </button>
          </div>
        ))
      )
    )}
  </div>
);

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
  alignItems: 'center',
  padding: '8px 12px',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: 'var(--text-secondary)',
  backgroundColor: 'var(--bg-tertiary)',
  cursor: 'pointer',
};

const fileItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: '13px',
};
