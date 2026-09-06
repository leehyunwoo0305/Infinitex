import React, { useState, useEffect, useCallback } from 'react';
import {
  VscServer,
  VscPlay,
  VscDebugDisconnect,
  VscRefresh,
  VscTrash,
  VscAdd,
  VscSearch,
  VscTerminal,
  VscCheck,
  VscWarning,
  VscArrowUp,
  VscArrowDown,
  VscClose,
  VscChevronRight,
  VscChevronDown,
  VscEye
} from 'react-icons/vsc';
import { useStore } from '../../store/useStore';
import { isElectronApp, electronAPI } from '../../utils/electron';

type DockerTab = 'containers' | 'images' | 'logs';

interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: string;
  state: 'running' | 'stopped' | 'paused' | 'exited' | 'created';
  ports: string;
  created: string;
}

interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  size: string;
  created: string;
}

export const DockerManager: React.FC = () => {
  const { workspacePath } = useStore();
  const [activeTab, setActiveTab] = useState<DockerTab>('containers');
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [images, setImages] = useState<DockerImage[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dockerAvailable, setDockerAvailable] = useState<boolean | null>(null);

  const checkDocker = useCallback(async () => {
    if (!isElectronApp || !electronAPI) return;

    try {
      const result = await electronAPI.terminalExec('docker --version');
      setDockerAvailable(result.success);
    } catch {
      setDockerAvailable(false);
    }
  }, []);

  const loadContainers = useCallback(async () => {
    if (!isElectronApp || !electronAPI) return;

    setLoading(true);
    try {
      const result = await electronAPI.terminalExec('docker ps -a --format "{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}|{{.State}}|{{.Ports}}|{{.CreatedAt}}"');
      if (result.stdout) {
        const containerList = result.stdout.split('\n').filter(Boolean).map(line => {
          const [id, name, image, status, state, ports, created] = line.split('|');
          return {
            id,
            name,
            image,
            status,
            state: state as DockerContainer['state'],
            ports,
            created,
          };
        });
        setContainers(containerList);
      }
    } catch (error) {
      console.error('Failed to load containers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadImages = useCallback(async () => {
    if (!isElectronApp || !electronAPI) return;

    setLoading(true);
    try {
      const result = await electronAPI.terminalExec('docker images --format "{{.ID}}|{{.Repository}}|{{.Tag}}|{{.Size}}|{{.CreatedAt}}"');
      if (result.stdout) {
        const imageList = result.stdout.split('\n').filter(Boolean).map(line => {
          const [id, repository, tag, size, created] = line.split('|');
          return { id, repository, tag, size, created };
        });
        setImages(imageList);
      }
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkDocker();
  }, [checkDocker]);

  useEffect(() => {
    if (dockerAvailable) {
      loadContainers();
      loadImages();
    }
  }, [dockerAvailable, loadContainers, loadImages]);

  const loadContainerLogs = async (containerId: string) => {
    if (!isElectronApp || !electronAPI) return;

    setSelectedContainer(containerId);
    setActiveTab('logs');
    setLoading(true);

    try {
      const result = await electronAPI.terminalExec(`docker logs --tail 100 ${containerId}`);
      const logLines = [];
      if (result.stdout) logLines.push(...result.stdout.split('\n'));
      if (result.stderr) logLines.push(...result.stderr.split('\n'));
      setLogs(logLines.filter(Boolean));
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const startContainer = async (containerId: string) => {
    if (!isElectronApp || !electronAPI) return;

    setLoading(true);
    try {
      await electronAPI.terminalExec(`docker start ${containerId}`);
      await loadContainers();
    } finally {
      setLoading(false);
    }
  };

  const stopContainer = async (containerId: string) => {
    if (!isElectronApp || !electronAPI) return;

    setLoading(true);
    try {
      await electronAPI.terminalExec(`docker stop ${containerId}`);
      await loadContainers();
    } finally {
      setLoading(false);
    }
  };

  const deleteContainer = async (containerId: string) => {
    if (!isElectronApp || !electronAPI) return;

    setLoading(true);
    try {
      await electronAPI.terminalExec(`docker rm ${containerId}`);
      await loadContainers();
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!isElectronApp || !electronAPI) return;

    setLoading(true);
    try {
      await electronAPI.terminalExec(`docker rmi ${imageId}`);
      await loadImages();
    } finally {
      setLoading(false);
    }
  };

  const pullImage = async (imageName: string) => {
    if (!isElectronApp || !electronAPI) return;

    setLoading(true);
    try {
      await electronAPI.terminalExec(`docker pull ${imageName}`);
      await loadImages();
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state: DockerContainer['state']) => {
    switch (state) {
      case 'running': return '#4ec9b0';
      case 'stopped': return '#f44747';
      case 'exited': return '#858585';
      case 'paused': return '#cca700';
      default: return '#858585';
    }
  };

  const filteredContainers = containers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.image.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredImages = images.filter(i =>
    i.repository.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (dockerAvailable === false) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-secondary)',
      }}>
        <VscServer size={48} />
        <div style={{ marginTop: '16px' }}>Docker is not installed or not in PATH</div>
        <div style={{ marginTop: '8px', fontSize: '12px' }}>
          Install Docker Desktop from https://docker.com
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
        <VscServer size={20} color="var(--accent-color)" />
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          Docker
        </span>
        <div style={{ flex: 1 }} />
        <button onClick={() => { loadContainers(); loadImages(); }} disabled={loading} style={toolBtnStyle} title="Refresh">
          <VscRefresh size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
      }}>
        {[
          { id: 'containers', label: `Containers (${containers.length})` },
          { id: 'images', label: `Images (${images.length})` },
          { id: 'logs', label: 'Logs' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as DockerTab)}
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
            placeholder="Search..."
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

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }} className="scrollbar">
        {activeTab === 'containers' && (
          filteredContainers.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '12px',
            }}>
              {containers.length === 0 ? 'No containers' : 'No matches found'}
            </div>
          ) : (
            filteredContainers.map(container => (
              <div
                key={container.id}
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
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: getStateColor(container.state),
                    }}
                  />
                  <span style={{
                    flex: 1,
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)',
                  }}>
                    {container.name}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {container.state !== 'running' && (
                      <button onClick={() => startContainer(container.id)} style={toolBtnStyle} title="Start">
                        <VscPlay size={12} color="#4ec9b0" />
                      </button>
                    )}
                    {container.state === 'running' && (
                      <button onClick={() => stopContainer(container.id)} style={toolBtnStyle} title="Stop">
                        <VscDebugDisconnect size={12} color="#f44747" />
                      </button>
                    )}
                    <button onClick={() => loadContainerLogs(container.id)} style={toolBtnStyle} title="Logs">
                      <VscEye size={12} />
                    </button>
                    <button onClick={() => deleteContainer(container.id)} style={toolBtnStyle} title="Delete">
                      <VscTrash size={12} />
                    </button>
                  </div>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  gap: '16px',
                }}>
                  <span>{container.image}</span>
                  <span>{container.status}</span>
                </div>
                {container.ports && (
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    marginTop: '4px',
                  }}>
                    Ports: {container.ports}
                  </div>
                )}
              </div>
            ))
          )
        )}

        {activeTab === 'images' && (
          filteredImages.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '12px',
            }}>
              {images.length === 0 ? 'No images' : 'No matches found'}
            </div>
          ) : (
            filteredImages.map(image => (
              <div
                key={image.id}
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
                  <VscServer size={14} color="var(--text-secondary)" />
                  <span style={{
                    flex: 1,
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)',
                  }}>
                    {image.repository}
                  </span>
                  <span style={{
                    padding: '1px 6px',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                  }}>
                    {image.tag}
                  </span>
                  <button onClick={() => deleteImage(image.id)} style={toolBtnStyle} title="Delete">
                    <VscTrash size={12} />
                  </button>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  gap: '16px',
                }}>
                  <span>{image.size}</span>
                  <span>{image.id.substring(0, 12)}</span>
                </div>
              </div>
            ))
          )
        )}

        {activeTab === 'logs' && (
          <div style={{
            padding: '12px 16px',
            fontFamily: "'Consolas', 'Monaco', monospace",
            fontSize: '12px',
            lineHeight: '1.5',
          }}>
            {logs.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                padding: '40px',
              }}>
                {selectedContainer ? 'Loading logs...' : 'Select a container to view logs'}
              </div>
            ) : (
              logs.map((line, index) => (
                <div
                  key={index}
                  style={{
                    color: line.toLowerCase().includes('error') ? '#f44747' : 'var(--text-primary)',
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
