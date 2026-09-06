import React, { useState, useEffect, useCallback } from 'react';
import {
  VscPackage,
  VscRefresh,
  VscAdd,
  VscTrash,
  VscArrowUp,
  VscSearch,
  VscCheck,
  VscWarning,
  VscTerminal,
  VscFolder
} from 'react-icons/vsc';
import { useStore } from '../../store/useStore';
import { isElectronApp, electronAPI } from '../../utils/electron';

interface Package {
  name: string;
  version: string;
  latestVersion?: string;
  description?: string;
  isDev: boolean;
  hasUpdate: boolean;
}

type PackageManager = 'npm' | 'yarn' | 'pnpm';

export const PackageManagerUI: React.FC = () => {
  const { workspacePath } = useStore();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [installInput, setInstallInput] = useState('');
  const [packageManager, setPackageManager] = useState<PackageManager>('npm');
  const [output, setOutput] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'installed' | 'output'>('installed');
  const [hasPackageJson, setHasPackageJson] = useState(false);

  const checkPackageJson = useCallback(async () => {
    if (!workspacePath || !isElectronApp || !electronAPI) return;
    const exists = await electronAPI.exists(`${workspacePath}/package.json`);
    setHasPackageJson(!!exists);
  }, [workspacePath]);

  const detectPackageManager = useCallback(async () => {
    if (!workspacePath || !isElectronApp || !electronAPI) return;

    const hasYarnLock = await electronAPI.exists(`${workspacePath}/yarn.lock`);
    const hasPnpmLock = await electronAPI.exists(`${workspacePath}/pnpm-lock.yaml`);

    if (hasYarnLock) setPackageManager('yarn');
    else if (hasPnpmLock) setPackageManager('pnpm');
    else setPackageManager('npm');
  }, [workspacePath]);

  useEffect(() => {
    if (workspacePath) {
      checkPackageJson();
      detectPackageManager();
    }
  }, [workspacePath, checkPackageJson, detectPackageManager]);

  const loadPackages = useCallback(async () => {
    if (!workspacePath || !isElectronApp || !electronAPI || !hasPackageJson) return;

    setLoading(true);
    setOutput([]);

    try {
      const cmd = packageManager === 'npm' ? 'npm list --depth=0 --json' :
                  packageManager === 'yarn' ? 'yarn list --depth=0 --json' :
                  'pnpm list --depth=0 --json';

      const result = await electronAPI.terminalExec(cmd, workspacePath);

      if (result.stdout) {
        try {
          const data = JSON.parse(result.stdout);
          const deps = data.dependencies || {};
          const devDeps = data.devDependencies || {};

          const pkgList: Package[] = [];

          for (const [name, info] of Object.entries(deps as Record<string, any>)) {
            pkgList.push({
              name,
              version: info.version || 'unknown',
              description: info.description,
              isDev: false,
              hasUpdate: false,
            });
          }

          for (const [name, info] of Object.entries(devDeps as Record<string, any>)) {
            pkgList.push({
              name,
              version: info.version || 'unknown',
              description: info.description,
              isDev: true,
              hasUpdate: false,
            });
          }

          setPackages(pkgList);
        } catch {
          setOutput(prev => [...prev, 'Failed to parse package list']);
        }
      }

      if (result.stderr) {
        setOutput(prev => [...prev, result.stderr]);
      }
    } catch (error: any) {
      setOutput(prev => [...prev, error.message]);
    } finally {
      setLoading(false);
    }
  }, [workspacePath, packageManager, hasPackageJson]);

  useEffect(() => {
    if (hasPackageJson) {
      loadPackages();
    }
  }, [hasPackageJson, loadPackages]);

  const installPackage = async () => {
    if (!installInput || !workspacePath || !isElectronApp || !electronAPI) return;

    setLoading(true);
    setOutput([]);
    setActiveTab('output');

    const cmd = packageManager === 'npm' ? `npm install ${installInput}` :
                packageManager === 'yarn' ? `yarn add ${installInput}` :
                `pnpm add ${installInput}`;

    setOutput(prev => [...prev, `$ ${cmd}`]);

    try {
      const result = await electronAPI.terminalExec(cmd, workspacePath);

      if (result.stdout) {
        setOutput(prev => [...prev, result.stdout]);
      }
      if (result.stderr) {
        setOutput(prev => [...prev, result.stderr]);
      }

      setInstallInput('');
      await loadPackages();
    } catch (error: any) {
      setOutput(prev => [...prev, error.message]);
    } finally {
      setLoading(false);
    }
  };

  const uninstallPackage = async (packageName: string) => {
    if (!workspacePath || !isElectronApp || !electronAPI) return;

    setLoading(true);
    setOutput([]);
    setActiveTab('output');

    const cmd = packageManager === 'npm' ? `npm uninstall ${packageName}` :
                packageManager === 'yarn' ? `yarn remove ${packageName}` :
                `pnpm remove ${packageName}`;

    setOutput(prev => [...prev, `$ ${cmd}`]);

    try {
      const result = await electronAPI.terminalExec(cmd, workspacePath);

      if (result.stdout) {
        setOutput(prev => [...prev, result.stdout]);
      }
      if (result.stderr) {
        setOutput(prev => [...prev, result.stderr]);
      }

      await loadPackages();
    } catch (error: any) {
      setOutput(prev => [...prev, error.message]);
    } finally {
      setLoading(false);
    }
  };

  const updatePackage = async (packageName: string) => {
    if (!workspacePath || !isElectronApp || !electronAPI) return;

    setLoading(true);
    setOutput([]);
    setActiveTab('output');

    const cmd = packageManager === 'npm' ? `npm install ${packageName}@latest` :
                packageManager === 'yarn' ? `yarn upgrade ${packageName}@latest` :
                `pnpm update ${packageName}@latest`;

    setOutput(prev => [...prev, `$ ${cmd}`]);

    try {
      const result = await electronAPI.terminalExec(cmd, workspacePath);

      if (result.stdout) {
        setOutput(prev => [...prev, result.stdout]);
      }
      if (result.stderr) {
        setOutput(prev => [...prev, result.stderr]);
      }

      await loadPackages();
    } catch (error: any) {
      setOutput(prev => [...prev, error.message]);
    } finally {
      setLoading(false);
    }
  };

  const runScript = async (scriptName: string) => {
    if (!workspacePath || !isElectronApp || !electronAPI) return;

    setLoading(true);
    setOutput([]);
    setActiveTab('output');

    const cmd = packageManager === 'npm' ? `npm run ${scriptName}` :
                packageManager === 'yarn' ? `yarn ${scriptName}` :
                `pnpm ${scriptName}`;

    setOutput(prev => [...prev, `$ ${cmd}`]);

    try {
      const result = await electronAPI.terminalExec(cmd, workspacePath);

      if (result.stdout) {
        setOutput(prev => [...prev, result.stdout]);
      }
      if (result.stderr) {
        setOutput(prev => [...prev, result.stderr]);
      }
    } catch (error: any) {
      setOutput(prev => [...prev, error.message]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!hasPackageJson) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-secondary)',
      }}>
        <VscPackage size={48} />
        <div style={{ marginTop: '16px' }}>No package.json found in workspace</div>
        <div style={{ marginTop: '8px', fontSize: '12px' }}>
          Open a folder with a Node.js project
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <VscPackage size={20} color="var(--accent-color)" />
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          Package Manager
        </span>
        <span style={{
          padding: '2px 8px',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '4px',
          fontSize: '11px',
          color: 'var(--text-secondary)',
        }}>
          {packageManager.toUpperCase()}
        </span>
        <div style={{ flex: 1 }} />
        <button onClick={loadPackages} disabled={loading} style={toolBtnStyle} title="Refresh">
          <VscRefresh size={14} />
        </button>
      </div>

      {/* Install Input */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        gap: '8px',
      }}>
        <input
          type="text"
          value={installInput}
          onChange={(e) => setInstallInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && installPackage()}
          placeholder="Install package (e.g., lodash)"
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <button
          onClick={installPackage}
          disabled={loading || !installInput}
          style={{
            padding: '8px 16px',
            backgroundColor: installInput ? 'var(--accent-color)' : 'var(--bg-tertiary)',
            color: installInput ? 'white' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '4px',
            cursor: installInput ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
          }}
        >
          <VscAdd size={14} />
          Install
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
      }}>
        {[
          { id: 'installed', label: `Installed (${packages.length})` },
          { id: 'output', label: 'Output' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-color)' : '2px solid transparent',
              backgroundColor: activeTab === tab.id ? 'var(--bg-tertiary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'installed' && (
          <>
            {/* Search */}
            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ position: 'relative' }}>
                <VscSearch
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                  }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search packages..."
                  style={{
                    width: '100%',
                    padding: '6px 8px 6px 28px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Package List */}
            <div style={{ overflow: 'auto', height: 'calc(100% - 45px)' }} className="scrollbar">
              {filteredPackages.length === 0 ? (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                }}>
                  {packages.length === 0 ? 'No packages installed' : 'No matches found'}
                </div>
              ) : (
                filteredPackages.map(pkg => (
                  <div
                    key={pkg.name}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px',
                    }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: 'var(--text-primary)',
                      }}>
                        {pkg.name}
                      </span>
                      <span style={{
                        padding: '1px 6px',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                      }}>
                        v{pkg.version}
                      </span>
                      {pkg.isDev && (
                        <span style={{
                          padding: '1px 6px',
                          backgroundColor: 'rgba(204, 167, 0, 0.2)',
                          color: '#cca700',
                          borderRadius: '4px',
                          fontSize: '10px',
                        }}>
                          dev
                        </span>
                      )}
                      <div style={{ flex: 1 }} />
                      <button
                        onClick={() => updatePackage(pkg.name)}
                        disabled={loading}
                        style={toolBtnStyle}
                        title="Update"
                      >
                        <VscArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => uninstallPackage(pkg.name)}
                        disabled={loading}
                        style={toolBtnStyle}
                        title="Uninstall"
                      >
                        <VscTrash size={12} />
                      </button>
                    </div>
                    {pkg.description && (
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {pkg.description}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'output' && (
          <div style={{
            overflow: 'auto',
            height: '100%',
            padding: '12px 16px',
            backgroundColor: 'var(--bg-primary)',
            fontFamily: "'Consolas', 'Monaco', monospace",
            fontSize: '12px',
            lineHeight: '1.5',
          }} className="scrollbar">
            {output.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                padding: '40px',
              }}>
                {loading ? 'Running command...' : 'No output'}
              </div>
            ) : (
              output.map((line, index) => (
                <div
                  key={index}
                  style={{
                    color: line.startsWith('$') ? 'var(--accent-color)' : 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {line}
                </div>
              ))
            )}
          </div>
        )}
      </div>
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
