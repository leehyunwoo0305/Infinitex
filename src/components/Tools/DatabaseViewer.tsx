import React, { useState } from 'react';
import {
  VscDatabase,
  VscPlay,
  VscDebugDisconnect,
  VscRefresh,
  VscAdd,
  VscTrash,
  VscTable,
  VscSearch,
  VscCopy,
  VscSave,
  VscClose,
  VscChevronRight,
  VscChevronDown,
  VscWarning
} from 'react-icons/vsc';
import { useStore } from '../../store/useStore';
import { isElectronApp, electronAPI } from '../../utils/electron';

type DbType = 'sqlite' | 'mysql' | 'postgresql';

interface DatabaseConnection {
  id: string;
  name: string;
  type: DbType;
  filename?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
}

interface QueryResult {
  columns: string[];
  rows: any[][];
  affectedRows?: number;
  error?: string;
  time: number;
}

export const DatabaseViewer: React.FC = () => {
  const { workspacePath } = useStore();
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNewConnection, setShowNewConnection] = useState(false);
  const [newConnection, setNewConnection] = useState<Partial<DatabaseConnection>>({
    type: 'sqlite',
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tables: true,
  });

  const activeConnection = connections.find(c => c.id === activeConnectionId);

  const connectToDatabase = async (conn: DatabaseConnection) => {
    if (!isElectronApp || !electronAPI || !workspacePath) return;

    setLoading(true);
    try {
      let cmd = '';
      if (conn.type === 'sqlite') {
        cmd = `sqlite3 "${conn.filename}" ".tables"`;
      } else if (conn.type === 'mysql') {
        cmd = `mysql -h ${conn.host} -P ${conn.port} -u ${conn.username} -p${conn.password} ${conn.database} -e "SHOW TABLES"`;
      } else if (conn.type === 'postgresql') {
        cmd = `psql -h ${conn.host} -p ${conn.port} -U ${conn.username} -d ${conn.database} -c "\\dt"`;
      }

      const result = await electronAPI.terminalExec(cmd, workspacePath || undefined);
      if (result.stdout) {
        const tableList = result.stdout.split('\n').filter(Boolean).map(t => t.trim());
        setTables(tableList);
        setActiveConnectionId(conn.id);
      }
    } catch (error: any) {
      console.error('Failed to connect:', error);
    } finally {
      setLoading(false);
    }
  };

  const addConnection = () => {
    if (!newConnection.name) return;

    const conn: DatabaseConnection = {
      id: Date.now().toString(),
      name: newConnection.name,
      type: newConnection.type || 'sqlite',
      filename: newConnection.filename,
      host: newConnection.host || 'localhost',
      port: newConnection.port || (newConnection.type === 'mysql' ? 3306 : 5432),
      database: newConnection.database,
      username: newConnection.username,
      password: newConnection.password,
    };

    setConnections([...connections, conn]);
    setShowNewConnection(false);
    setNewConnection({ type: 'sqlite' });
  };

  const deleteConnection = (id: string) => {
    setConnections(connections.filter(c => c.id !== id));
    if (activeConnectionId === id) {
      setActiveConnectionId(null);
      setTables([]);
      setSelectedTable(null);
    }
  };

  const executeQuery = async () => {
    if (!activeConnection || !query || !isElectronApp || !electronAPI) return;

    setLoading(true);
    const startTime = Date.now();

    try {
      let cmd = '';
      if (activeConnection.type === 'sqlite') {
        cmd = `sqlite3 "${activeConnection.filename}" "${query.replace(/"/g, '""')}"`;
      } else if (activeConnection.type === 'mysql') {
        cmd = `mysql -h ${activeConnection.host} -P ${activeConnection.port} -u ${activeConnection.username} -p${activeConnection.password} ${activeConnection.database} -e "${query.replace(/"/g, '""')}"`;
      } else if (activeConnection.type === 'postgresql') {
        cmd = `psql -h ${activeConnection.host} -p ${activeConnection.port} -U ${activeConnection.username} -d ${activeConnection.database} -c "${query.replace(/"/g, '""')}"`;
      }

      const result = await electronAPI.terminalExec(cmd, workspacePath || undefined);
      const time = Date.now() - startTime;

      if (result.stderr) {
        setQueryResult({
          columns: [],
          rows: [],
          error: result.stderr,
          time,
        });
      } else {
        const lines = result.stdout.split('\n').filter(Boolean);
        if (lines.length > 0) {
          const columns = lines[0].split(/[|\t]+/).map(c => c.trim());
          const rows = lines.slice(1).map(line => line.split(/[|\t]+/).map(c => c.trim()));
          setQueryResult({ columns, rows, time });
        } else {
          setQueryResult({ columns: [], rows: [], time });
        }
      }
    } catch (error: any) {
      setQueryResult({
        columns: [],
        rows: [],
        error: error.message,
        time: Date.now() - startTime,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async (tableName: string) => {
    setSelectedTable(tableName);
    setQuery(`SELECT * FROM ${tableName} LIMIT 100;`);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Sidebar - Connections */}
      <div style={{
        width: '250px',
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
          <VscDatabase size={16} color="var(--accent-color)" />
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Databases
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={() => setShowNewConnection(true)} style={toolBtnStyle} title="New Connection">
            <VscAdd size={14} />
          </button>
        </div>

        {/* New Connection Form */}
        {showNewConnection && (
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
            <input
              type="text"
              value={newConnection.name || ''}
              onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
              placeholder="Connection name"
              style={inputStyle}
            />
            <select
              value={newConnection.type || 'sqlite'}
              onChange={(e) => setNewConnection({ ...newConnection, type: e.target.value as DbType })}
              style={inputStyle}
            >
              <option value="sqlite">SQLite</option>
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
            </select>
            {newConnection.type === 'sqlite' ? (
              <input
                type="text"
                value={newConnection.filename || ''}
                onChange={(e) => setNewConnection({ ...newConnection, filename: e.target.value })}
                placeholder="Database file path"
                style={inputStyle}
              />
            ) : (
              <>
                <input
                  type="text"
                  value={newConnection.host || 'localhost'}
                  onChange={(e) => setNewConnection({ ...newConnection, host: e.target.value })}
                  placeholder="Host"
                  style={inputStyle}
                />
                <input
                  type="number"
                  value={newConnection.port || (newConnection.type === 'mysql' ? 3306 : 5432)}
                  onChange={(e) => setNewConnection({ ...newConnection, port: parseInt(e.target.value) })}
                  placeholder="Port"
                  style={inputStyle}
                />
                <input
                  type="text"
                  value={newConnection.database || ''}
                  onChange={(e) => setNewConnection({ ...newConnection, database: e.target.value })}
                  placeholder="Database"
                  style={inputStyle}
                />
                <input
                  type="text"
                  value={newConnection.username || ''}
                  onChange={(e) => setNewConnection({ ...newConnection, username: e.target.value })}
                  placeholder="Username"
                  style={inputStyle}
                />
                <input
                  type="password"
                  value={newConnection.password || ''}
                  onChange={(e) => setNewConnection({ ...newConnection, password: e.target.value })}
                  placeholder="Password"
                  style={inputStyle}
                />
              </>
            )}
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
              <button onClick={addConnection} style={{ ...toolBtnStyle, width: 'auto', padding: '0 12px' }}>
                Connect
              </button>
              <button onClick={() => setShowNewConnection(false)} style={toolBtnStyle}>
                <VscClose size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Connection List */}
        <div style={{ flex: 1, overflow: 'auto' }} className="scrollbar">
          {connections.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '12px',
            }}>
              No connections
            </div>
          ) : (
            connections.map(conn => (
              <div
                key={conn.id}
                onClick={() => connectToDatabase(conn)}
                style={{
                  padding: '12px',
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  backgroundColor: activeConnectionId === conn.id ? 'var(--bg-tertiary)' : 'transparent',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <VscDatabase size={14} color={activeConnectionId === conn.id ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                  <span style={{
                    flex: 1,
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                  }}>
                    {conn.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConnection(conn.id);
                    }}
                    style={toolBtnStyle}
                  >
                    <VscTrash size={12} />
                  </button>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  marginTop: '4px',
                }}>
                  {conn.type.toUpperCase()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tables */}
        {tables.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-color)' }}>
            <div
              style={sectionHeaderStyle}
              onClick={() => toggleSection('tables')}
            >
              {expandedSections.tables ? <VscChevronDown size={12} /> : <VscChevronRight size={12} />}
              <span style={{ marginLeft: '4px' }}>Tables</span>
              <span>{tables.length}</span>
            </div>
            {expandedSections.tables && (
              <div style={{ maxHeight: '200px', overflow: 'auto' }} className="scrollbar">
                {tables.map(table => (
                  <div
                    key={table}
                    onClick={() => loadTableData(table)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: selectedTable === table ? 'var(--accent-color)' : 'var(--text-primary)',
                      backgroundColor: selectedTable === table ? 'var(--bg-tertiary)' : 'transparent',
                    }}
                  >
                    <VscTable size={12} style={{ marginRight: '8px' }} />
                    {table}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Query Editor */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          gap: '8px',
        }}>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                executeQuery();
              }
            }}
            placeholder="Enter SQL query (Ctrl+Enter to execute)"
            style={{
              flex: 1,
              height: '80px',
              padding: '8px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontFamily: "'Consolas', 'Monaco', monospace",
              fontSize: '13px',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            spellCheck={false}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={executeQuery}
              disabled={loading || !query}
              style={{
                padding: '8px 16px',
                backgroundColor: query ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                color: query ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '4px',
                cursor: query ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
              }}
            >
              <VscPlay size={14} />
              Run
            </button>
          </div>
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflow: 'auto' }} className="scrollbar">
          {queryResult ? (
            queryResult.error ? (
              <div style={{
                padding: '20px',
                color: '#f44747',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <VscWarning size={16} />
                {queryResult.error}
              </div>
            ) : queryResult.columns.length > 0 ? (
              <div style={{ padding: '12px' }}>
                <div style={{
                  marginBottom: '8px',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                }}>
                  {queryResult.rows.length} rows in {queryResult.time}ms
                </div>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '12px',
                }}>
                  <thead>
                    <tr>
                      {queryResult.columns.map((col, i) => (
                        <th key={i} style={thStyle}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} style={tdStyle}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                padding: '20px',
                color: 'var(--text-secondary)',
              }}>
                Query executed successfully in {queryResult.time}ms
              </div>
            )
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-secondary)',
            }}>
              <VscDatabase size={48} />
              <div style={{ marginTop: '16px' }}>Connect to a database and run a query</div>
            </div>
          )}
        </div>
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

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  marginBottom: '6px',
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border-color)',
  borderRadius: '4px',
  color: 'var(--text-primary)',
  fontSize: '12px',
  outline: 'none',
  boxSizing: 'border-box',
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

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  textAlign: 'left',
  fontWeight: 'bold',
  borderBottom: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-tertiary)',
};

const tdStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderBottom: '1px solid var(--border-color)',
};
