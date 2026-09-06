import React, { useState, useEffect, useCallback } from 'react';
import {
  VscCode,
  VscAdd,
  VscTrash,
  VscCopy,
  VscSearch,
  VscSave,
  VscClose,
  VscFolder,
  VscFile
} from 'react-icons/vsc';
import { useStore } from '../../store/useStore';

interface Snippet {
  id: string;
  name: string;
  language: string;
  code: string;
  description: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'infinitex-snippets';

const LANGUAGE_OPTIONS = [
  'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'c',
  'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'html', 'css',
  'scss', 'sql', 'bash', 'powershell', 'json', 'yaml', 'markdown', 'plaintext'
];

export const SnippetManager: React.FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [editForm, setEditForm] = useState({
    name: '',
    language: 'javascript',
    code: '',
    description: '',
    tags: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSnippets(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load snippets:', e);
      }
    }
  }, []);

  const saveSnippets = (newSnippets: Snippet[]) => {
    setSnippets(newSnippets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSnippets));
  };

  const createSnippet = () => {
    const newSnippet: Snippet = {
      id: Date.now().toString(),
      name: 'Untitled Snippet',
      language: 'javascript',
      code: '',
      description: '',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSnippets([newSnippet, ...snippets]);
    setSelectedSnippet(newSnippet);
    setIsEditing(true);
    setEditForm({
      name: newSnippet.name,
      language: newSnippet.language,
      code: newSnippet.code,
      description: newSnippet.description,
      tags: newSnippet.tags.join(', '),
    });
  };

  const updateSnippet = () => {
    if (!selectedSnippet) return;

    const updated: Snippet = {
      ...selectedSnippet,
      name: editForm.name,
      language: editForm.language,
      code: editForm.code,
      description: editForm.description,
      tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      updatedAt: Date.now(),
    };

    saveSnippets(snippets.map(s => s.id === updated.id ? updated : s));
    setSelectedSnippet(updated);
    setIsEditing(false);
  };

  const deleteSnippet = (id: string) => {
    saveSnippets(snippets.filter(s => s.id !== id));
    if (selectedSnippet?.id === id) {
      setSelectedSnippet(null);
      setIsEditing(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const filteredSnippets = snippets.filter(s => {
    const matchesSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLanguage = filterLanguage === 'all' || s.language === filterLanguage;
    return matchesSearch && matchesLanguage;
  });

  const selectSnippet = (snippet: Snippet) => {
    setSelectedSnippet(snippet);
    setIsEditing(false);
    setEditForm({
      name: snippet.name,
      language: snippet.language,
      code: snippet.code,
      description: snippet.description,
      tags: snippet.tags.join(', '),
    });
  };

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Sidebar - Snippet List */}
      <div style={{
        width: '280px',
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
          <VscCode size={16} color="var(--accent-color)" />
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Snippets
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={createSnippet} style={toolBtnStyle} title="New Snippet">
            <VscAdd size={14} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>
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
              placeholder="Search snippets..."
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

        {/* Language Filter */}
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontSize: '12px',
              outline: 'none',
            }}
          >
            <option value="all">All Languages</option>
            {LANGUAGE_OPTIONS.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        {/* Snippet List */}
        <div style={{ flex: 1, overflow: 'auto' }} className="scrollbar">
          {filteredSnippets.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '12px',
            }}>
              {snippets.length === 0 ? 'No snippets yet' : 'No matches found'}
            </div>
          ) : (
            filteredSnippets.map(snippet => (
              <div
                key={snippet.id}
                onClick={() => selectSnippet(snippet)}
                style={{
                  padding: '12px',
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  backgroundColor: selectedSnippet?.id === snippet.id ? 'var(--bg-tertiary)' : 'transparent',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                }}>
                  <VscFile size={14} color="var(--text-secondary)" />
                  <span style={{
                    flex: 1,
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {snippet.name}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                }}>
                  <span style={{
                    padding: '1px 6px',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: '4px',
                  }}>
                    {snippet.language}
                  </span>
                  <span>{snippet.tags.slice(0, 2).join(', ')}</span>
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
        {!selectedSnippet ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
          }}>
            <VscCode size={48} />
            <div style={{ marginTop: '16px' }}>Select or create a snippet</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    outline: 'none',
                  }}
                />
              ) : (
                <span style={{ flex: 1, fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {selectedSnippet.name}
                </span>
              )}

              <div style={{ display: 'flex', gap: '4px' }}>
                {isEditing ? (
                  <>
                    <button onClick={updateSnippet} style={toolBtnStyle} title="Save">
                      <VscSave size={14} />
                    </button>
                    <button onClick={() => setIsEditing(false)} style={toolBtnStyle} title="Cancel">
                      <VscClose size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => copyToClipboard(selectedSnippet.code)} style={toolBtnStyle} title="Copy Code">
                      <VscCopy size={14} />
                    </button>
                    <button onClick={() => setIsEditing(true)} style={toolBtnStyle} title="Edit">
                      <VscFile size={14} />
                    </button>
                    <button onClick={() => deleteSnippet(selectedSnippet.id)} style={toolBtnStyle} title="Delete">
                      <VscTrash size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {isEditing ? (
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Description"
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
              </div>
            ) : selectedSnippet.description ? (
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
              }}>
                {selectedSnippet.description}
              </div>
            ) : null}

            {/* Language & Tags */}
            {isEditing && (
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                gap: '12px',
              }}>
                <select
                  value={editForm.language}
                  onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                  style={{
                    padding: '6px 8px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                >
                  {LANGUAGE_OPTIONS.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  placeholder="Tags (comma separated)"
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
              </div>
            )}

            {/* Code Editor */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {isEditing ? (
                <textarea
                  value={editForm.code}
                  onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: '12px',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    border: 'none',
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
                <pre style={{
                  margin: 0,
                  padding: '12px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: "'Consolas', 'Monaco', monospace",
                  fontSize: '13px',
                  lineHeight: '1.5',
                  overflow: 'auto',
                  height: '100%',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }} className="scrollbar">
                  {selectedSnippet.code || '// No code'}
                </pre>
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
