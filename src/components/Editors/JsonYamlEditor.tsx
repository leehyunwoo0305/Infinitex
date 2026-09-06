import React, { useState, useEffect, useCallback } from 'react';
import {
  VscJson,
  VscCheck,
  VscWarning,
  VscCopy,
  VscClippy,
  VscTrash,
  VscFile,
  VscFolder,
  VscChevronRight,
  VscChevronDown,
  VscRefresh
} from 'react-icons/vsc';
import { useStore } from '../../store/useStore';
import { isElectronApp, electronAPI } from '../../utils/electron';

type JsonViewMode = 'tree' | 'text';

interface JsonNode {
  key: string;
  value: any;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  path: string;
  expanded?: boolean;
}

export const JsonYamlEditor: React.FC = () => {
  const { activeFile, workspacePath } = useStore();
  const [content, setContent] = useState('');
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<JsonViewMode>('text');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const [isYaml, setIsYaml] = useState(false);
  const [yamlContent, setYamlContent] = useState('');

  const detectFormat = useCallback((filename: string) => {
    const ext = filename.toLowerCase().split('.').pop();
    return ext === 'yaml' || ext === 'yml';
  }, []);

  const loadFile = useCallback(async () => {
    if (!activeFile || !isElectronApp || !electronAPI) return;

    try {
      const result = await electronAPI.readFile(activeFile);
      if (result.success && result.content) {
        setContent(result.content);
        const yaml = detectFormat(activeFile);
        setIsYaml(yaml);

        if (yaml) {
          setYamlContent(result.content);
          try {
            const parsed = yamlToJson(result.content);
            setParsedJson(parsed);
            setParseError(null);
          } catch (e: any) {
            setParseError(e.message);
            setParsedJson(null);
          }
        } else {
          try {
            const parsed = JSON.parse(result.content);
            setParsedJson(parsed);
            setParseError(null);
          } catch (e: any) {
            setParseError(e.message);
            setParsedJson(null);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load file:', error);
    }
  }, [activeFile, isElectronApp, detectFormat]);

  useEffect(() => {
    if (activeFile) {
      loadFile();
    }
  }, [activeFile, loadFile]);

  const yamlToJson = (yaml: string): any => {
    const lines = yaml.split('\n');
    const result: any = {};
    let currentObj = result;
    let indentStack: { obj: any; indent: number }[] = [{ obj: result, indent: -1 }];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const indent = line.search(/\S/);
      const colonIndex = trimmed.indexOf(':');

      if (colonIndex === -1) continue;

      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();

      while (indentStack.length > 1 && indentStack[indentStack.length - 1].indent >= indent) {
        indentStack.pop();
      }

      currentObj = indentStack[indentStack.length - 1].obj;

      if (value === '' || value === '|' || value === '>') {
        currentObj[key] = {};
        indentStack.push({ obj: currentObj[key], indent });
      } else if (value.startsWith('[') && value.endsWith(']')) {
        currentObj[key] = JSON.parse(value);
      } else if (value === 'true') {
        currentObj[key] = true;
      } else if (value === 'false') {
        currentObj[key] = false;
      } else if (value === 'null') {
        currentObj[key] = null;
      } else if (!isNaN(Number(value))) {
        currentObj[key] = Number(value);
      } else {
        currentObj[key] = value.replace(/^["']|["']$/g, '');
      }
    }

    return result;
  };

  const jsonToYaml = (obj: any, indent: number = 0): string => {
    let yaml = '';
    const prefix = '  '.repeat(indent);

    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (typeof item === 'object' && item !== null) {
          yaml += `${prefix}-\n${jsonToYaml(item, indent + 1)}`;
        } else {
          yaml += `${prefix}- ${typeof item === 'string' ? `"${item}"` : item}\n`;
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          yaml += `${prefix}${key}:\n${jsonToYaml(value, indent + 1)}`;
        } else {
          yaml += `${prefix}${key}: ${typeof value === 'string' ? `"${value}"` : value}\n`;
        }
      }
    }

    return yaml;
  };

  const formatJson = () => {
    if (parsedJson) {
      const formatted = JSON.stringify(parsedJson, null, 2);
      setContent(formatted);
      if (isYaml) {
        setYamlContent(jsonToYaml(parsedJson));
      }
    }
  };

  const minifyJson = () => {
    if (parsedJson) {
      const minified = JSON.stringify(parsedJson);
      setContent(minified);
      if (isYaml) {
        setYamlContent(jsonToYaml(parsedJson));
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
  };

  const toggleNode = (path: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderTreeNode = (key: string, value: any, path: string, depth: number = 0): React.ReactNode => {
    const type = Array.isArray(value) ? 'array' : typeof value === 'object' && value !== null ? 'object' : typeof value === 'string' ? 'string' : typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'null';
    const isExpanded = expandedNodes.has(path);
    const hasChildren = type === 'object' || type === 'array';

    return (
      <div key={path} style={{ paddingLeft: `${depth * 16}px` }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '2px 4px',
            cursor: hasChildren ? 'pointer' : 'default',
            fontSize: '13px',
            fontFamily: 'monospace',
          }}
          onClick={() => hasChildren && toggleNode(path)}
        >
          {hasChildren && (
            <span style={{ marginRight: '4px', width: '12px' }}>
              {isExpanded ? <VscChevronDown size={12} /> : <VscChevronRight size={12} />}
            </span>
          )}
          {!hasChildren && <span style={{ marginRight: '4px', width: '12px' }} />}

          <span style={{ color: 'var(--accent-color)', marginRight: '4px' }}>{key}:</span>

          {type === 'string' && <span style={{ color: '#ce9178' }}>"{value}"</span>}
          {type === 'number' && <span style={{ color: '#b5cea8' }}>{value}</span>}
          {type === 'boolean' && <span style={{ color: '#569cd6' }}>{value.toString()}</span>}
          {type === 'null' && <span style={{ color: '#569cd6' }}>null</span>}
          {type === 'object' && !isExpanded && <span style={{ color: 'var(--text-secondary)' }}>{'{...}'}</span>}
          {type === 'array' && !isExpanded && <span style={{ color: 'var(--text-secondary)' }}>[...]</span>}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {type === 'object' && Object.entries(value).map(([k, v]) =>
              renderTreeNode(k, v, `${path}.${k}`, depth + 1)
            )}
            {type === 'array' && value.map((item: any, index: number) =>
              renderTreeNode(String(index), item, `${path}[${index}]`, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (!activeFile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-secondary)',
      }}>
        <VscJson size={48} />
        <div style={{ marginTop: '16px' }}>Open a JSON or YAML file to edit</div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      border: '1px solid var(--border-color)',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-color)',
        gap: '8px',
        backgroundColor: 'var(--bg-secondary)',
      }}>
        <VscJson size={16} color={parseError ? '#f44747' : '#4ec9b0'} />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {isYaml ? 'YAML' : 'JSON'}
        </span>

        {parseError && (
          <span style={{ fontSize: '11px', color: '#f44747', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <VscWarning size={12} />
            {parseError}
          </span>
        )}

        {!parseError && (
          <span style={{ fontSize: '11px', color: '#4ec9b0', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <VscCheck size={12} />
            Valid
          </span>
        )}

        <div style={{ flex: 1 }} />

        <button
          onClick={() => setViewMode('text')}
          style={{
            padding: '4px 8px',
            backgroundColor: viewMode === 'text' ? 'var(--bg-tertiary)' : 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          Text
        </button>
        <button
          onClick={() => setViewMode('tree')}
          style={{
            padding: '4px 8px',
            backgroundColor: viewMode === 'tree' ? 'var(--bg-tertiary)' : 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          Tree
        </button>

        <button onClick={formatJson} style={toolBtnStyle} title="Format">
          <VscRefresh size={14} />
        </button>
        <button onClick={minifyJson} style={toolBtnStyle} title="Minify">
          <VscClippy size={14} />
        </button>
        <button onClick={copyToClipboard} style={toolBtnStyle} title="Copy">
          <VscCopy size={14} />
        </button>
        <button onClick={loadFile} style={toolBtnStyle} title="Refresh">
          <VscRefresh size={14} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }} className="scrollbar">
        {viewMode === 'text' ? (
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              try {
                if (isYaml) {
                  const parsed = yamlToJson(e.target.value);
                  setParsedJson(parsed);
                  setParseError(null);
                } else {
                  const parsed = JSON.parse(e.target.value);
                  setParsedJson(parsed);
                  setParseError(null);
                }
              } catch (err: any) {
                setParseError(err.message);
              }
            }}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: 'none',
              padding: '12px',
              fontFamily: "'Consolas', 'Monaco', monospace",
              fontSize: '13px',
              lineHeight: '1.5',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            spellCheck={false}
          />
        ) : (
          <div style={{ padding: '12px' }}>
            {parsedJson ? (
              renderTreeNode('root', parsedJson, 'root')
            ) : (
              <div style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                padding: '40px',
              }}>
                {parseError ? 'Invalid JSON' : 'No data to display'}
              </div>
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
