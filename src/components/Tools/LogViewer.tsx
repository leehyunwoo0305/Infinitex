import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  VscTerminal,
  VscPlay,
  VscDebugDisconnect,
  VscClearAll,
  VscFilter,
  VscSearch,
  VscArrowDown,
  VscTrash,
  VscClose,
  VscAdd
} from 'react-icons/vsc';
import { isElectronApp, electronAPI } from '../../utils/electron';

interface LogEntry {
  id: number;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
}

interface LogStream {
  id: string;
  name: string;
  command: string;
  running: boolean;
  entries: LogEntry[];
}

export const LogViewer: React.FC = () => {
  const [streams, setStreams] = useState<LogStream[]>([]);
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState<Set<string>>(new Set(['info', 'warn', 'error', 'debug']));
  const [isPaused, setIsPaused] = useState(false);
  const [newStreamCommand, setNewStreamCommand] = useState('');
  const [showNewStream, setShowNewStream] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(1);

  const activeStream = streams.find(s => s.id === activeStreamId);

  const filteredEntries = activeStream?.entries.filter(entry => {
    const matchesLevel = levelFilter.has(entry.level);
    const matchesFilter = !filter ||
      entry.message.toLowerCase().includes(filter.toLowerCase()) ||
      entry.source?.toLowerCase().includes(filter.toLowerCase());
    return matchesLevel && matchesFilter;
  }) || [];

  useEffect(() => {
    if (logContainerRef.current && !isPaused) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [filteredEntries, isPaused]);

  const createStream = () => {
    if (!newStreamCommand.trim()) return;

    const newStream: LogStream = {
      id: nextIdRef.current.toString(),
      name: `Stream ${streams.length + 1}`,
      command: newStreamCommand,
      running: false,
      entries: [],
    };

    setStreams([...streams, newStream]);
    setActiveStreamId(newStream.id);
    setNewStreamCommand('');
    setShowNewStream(false);
  };

  const startStream = async (streamId: string) => {
    if (!isElectronApp || !electronAPI) return;

    const stream = streams.find(s => s.id === streamId);
    if (!stream) return;

    setStreams(streams.map(s =>
      s.id === streamId ? { ...s, running: true, entries: [] } : s
    ));

    try {
      const result = await electronAPI.terminalExec(stream.command);
      if (result.stdout || result.stderr) {
        const entries: LogEntry[] = [];
        if (result.stdout) {
          result.stdout.split('\n').filter(Boolean).forEach(line => {
            entries.push({
              id: nextIdRef.current++,
              timestamp: new Date(),
              level: detectLevel(line),
              message: line,
            });
          });
        }
        if (result.stderr) {
          result.stderr.split('\n').filter(Boolean).forEach(line => {
            entries.push({
              id: nextIdRef.current++,
              timestamp: new Date(),
              level: 'error',
              message: line,
            });
          });
        }

        setStreams(streams.map(s =>
          s.id === streamId ? { ...s, running: false, entries } : s
        ));
      } else {
        setStreams(streams.map(s =>
          s.id === streamId ? { ...s, running: false } : s
        ));
      }
    } catch (error: any) {
      setStreams(streams.map(s =>
        s.id === streamId ? {
          ...s,
          running: false,
          entries: [...s.entries, {
            id: nextIdRef.current++,
            timestamp: new Date(),
            level: 'error',
            message: error.message,
          }]
        } : s
      ));
    }
  };

  const stopStream = (streamId: string) => {
    setStreams(streams.map(s =>
      s.id === streamId ? { ...s, running: false } : s
    ));
  };

  const deleteStream = (streamId: string) => {
    setStreams(streams.filter(s => s.id !== streamId));
    if (activeStreamId === streamId) {
      setActiveStreamId(streams.length > 1 ? streams.find(s => s.id !== streamId)?.id || null : null);
    }
  };

  const clearStream = (streamId: string) => {
    setStreams(streams.map(s =>
      s.id === streamId ? { ...s, entries: [] } : s
    ));
  };

  const detectLevel = (line: string): LogEntry['level'] => {
    const lower = line.toLowerCase();
    if (lower.includes('error') || lower.includes('err') || lower.includes('fatal')) return 'error';
    if (lower.includes('warn') || lower.includes('warning')) return 'warn';
    if (lower.includes('debug') || lower.includes('dbg')) return 'debug';
    return 'info';
  };

  const toggleLevel = (level: string) => {
    setLevelFilter(prev => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return '#f44747';
      case 'warn': return '#cca700';
      case 'debug': return '#858585';
      default: return '#d4d4d4';
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Sidebar - Stream List */}
      <div style={{
        width: '200px',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-secondary)',
      }}>
        {/* Header */}
        <div style={{
          padding: '12px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <VscTerminal size={16} color="var(--accent-color)" />
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Logs
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={() => setShowNewStream(true)} style={toolBtnStyle} title="New Stream">
            <VscAdd size={14} />
          </button>
        </div>

        {/* New Stream Form */}
        {showNewStream && (
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>
            <input
              type="text"
              value={newStreamCommand}
              onChange={(e) => setNewStreamCommand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createStream()}
              placeholder="Command (e.g., npm run dev)"
              autoFocus
              style={{
                width: '100%',
                padding: '6px 8px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              <button
                onClick={createStream}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  backgroundColor: 'var(--accent-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                Add
              </button>
              <button
                onClick={() => setShowNewStream(false)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Stream List */}
        <div style={{ flex: 1, overflow: 'auto' }} className="scrollbar">
          {streams.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '12px',
            }}>
              No log streams
            </div>
          ) : (
            streams.map(stream => (
              <div
                key={stream.id}
                onClick={() => setActiveStreamId(stream.id)}
                style={{
                  padding: '12px',
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  backgroundColor: activeStreamId === stream.id ? 'var(--bg-tertiary)' : 'transparent',
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
                      backgroundColor: stream.running ? '#4ec9b0' : '#858585',
                    }}
                  />
                  <span style={{
                    flex: 1,
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {stream.name}
                  </span>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  fontFamily: 'monospace',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {stream.command}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {!activeStream ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
          }}>
            <VscTerminal size={48} />
            <div style={{ marginTop: '16px' }}>Select or create a log stream</div>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div style={{
              padding: '8px 12px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <button
                onClick={() => startStream(activeStream.id)}
                disabled={activeStream.running}
                style={{
                  ...toolBtnStyle,
                  color: activeStream.running ? 'var(--text-secondary)' : '#4ec9b0',
                  cursor: activeStream.running ? 'not-allowed' : 'pointer',
                }}
                title="Start"
              >
                <VscPlay size={14} />
              </button>
              <button
                onClick={() => stopStream(activeStream.id)}
                disabled={!activeStream.running}
                style={{
                  ...toolBtnStyle,
                color: !activeStream.running ? 'var(--text-secondary)' : '#f44747',
                cursor: !activeStream.running ? 'not-allowed' : 'pointer',
              }}
              title="Stop"
            >
              <VscDebugDisconnect size={14} />
              </button>
              <button onClick={() => clearStream(activeStream.id)} style={toolBtnStyle} title="Clear">
                <VscClearAll size={14} />
              </button>
              <button onClick={() => deleteStream(activeStream.id)} style={toolBtnStyle} title="Delete">
                <VscTrash size={14} />
              </button>

              <div style={{ flex: 1 }} />

              {/* Search */}
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
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter logs..."
                  style={{
                    width: '200px',
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

              {/* Level Filters */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {['info', 'warn', 'error', 'debug'].map(level => (
                  <button
                    key={level}
                    onClick={() => toggleLevel(level)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: levelFilter.has(level) ? getLevelColor(level as LogEntry['level']) : 'transparent',
                      color: levelFilter.has(level) ? 'white' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsPaused(!isPaused)}
                style={{
                  ...toolBtnStyle,
                color: isPaused ? '#cca700' : 'var(--text-primary)',
              }}
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <VscPlay size={14} /> : <VscDebugDisconnect size={14} />}
              </button>
            </div>

            {/* Log Output */}
            <div
              ref={logContainerRef}
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '8px',
                backgroundColor: 'var(--bg-primary)',
                fontFamily: "'Consolas', 'Monaco', monospace",
                fontSize: '12px',
                lineHeight: '1.5',
              }}
              className="scrollbar"
            >
              {filteredEntries.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  padding: '40px',
                }}>
                  {activeStream.running ? 'Waiting for logs...' : 'No log entries'}
                </div>
              ) : (
                filteredEntries.map(entry => (
                  <div
                    key={entry.id}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      padding: '2px 4px',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                    <span style={{
                      color: getLevelColor(entry.level),
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      minWidth: '50px',
                    }}>
                      [{entry.level.toUpperCase()}]
                    </span>
                    <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                      {entry.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
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
