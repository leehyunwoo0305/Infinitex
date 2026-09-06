import React, { useState, useCallback } from 'react';
import {
  VscSearch,
  VscCheck,
  VscWarning,
  VscCopy,
  VscTrash,
  VscAdd,
  VscRemove
} from 'react-icons/vsc';

interface RegexMatch {
  match: string;
  index: number;
  length: number;
  groups?: string[];
}

export const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState<RegexMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [highlightedText, setHighlightedText] = useState('');

  const testRegex = useCallback(() => {
    if (!pattern) {
      setMatches([]);
      setError(null);
      setHighlightedText(testString);
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const foundMatches: RegexMatch[] = [];
      let match: RegExpExecArray | null;

      if (flags.includes('g')) {
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            length: match[0].length,
            groups: match.slice(1),
          });
          if (match[0].length === 0) break;
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            length: match[0].length,
            groups: match.slice(1),
          });
        }
      }

      setMatches(foundMatches);
      setError(null);

      // Create highlighted text
      let highlighted = testString;
      let offset = 0;
      const sortedMatches = [...foundMatches].sort((a, b) => a.index - b.index);

      for (const m of sortedMatches) {
        const start = m.index + offset;
        const end = start + m.length;
        const before = highlighted.substring(0, start);
        const matchText = highlighted.substring(start, end);
        const after = highlighted.substring(end);
        highlighted = `${before}<mark style="background-color: #61afef; color: #282c34; padding: 1px 2px; border-radius: 2px;">${matchText}</mark>${after}`;
        offset += '<mark style="background-color: #61afef; color: #282c34; padding: 1px 2px; border-radius: 2px;"></mark>'.length;
      }

      setHighlightedText(highlighted);
    } catch (e: any) {
      setError(e.message);
      setMatches([]);
      setHighlightedText(testString);
    }
  }, [pattern, flags, testString]);

  const handlePatternChange = (value: string) => {
    setPattern(value);
    setTimeout(testRegex, 0);
  };

  const handleFlagsChange = (value: string) => {
    setFlags(value);
    setTimeout(testRegex, 0);
  };

  const handleTestStringChange = (value: string) => {
    setTestString(value);
    setTimeout(testRegex, 0);
  };

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
    setTimeout(testRegex, 0);
  };

  const copyRegex = () => {
    navigator.clipboard.writeText(`/${pattern}/${flags}`);
  };

  const clearAll = () => {
    setPattern('');
    setFlags('g');
    setTestString('');
    setMatches([]);
    setError(null);
    setHighlightedText('');
  };

  const commonPatterns = [
    { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { name: 'URL', pattern: 'https?://[^\\s/$.?#].[^\\s]*' },
    { name: 'Phone', pattern: '\\d{3}[-.]?\\d{3,4}[-.]?\\d{4}' },
    { name: 'IP Address', pattern: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b' },
    { name: 'Date', pattern: '\\d{4}[-/]\\d{2}[-/]\\d{2}' },
    { name: 'Number', pattern: '-?\\d+\\.?\\d*' },
    { name: 'Word', pattern: '\\b\\w+\\b' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '16px',
      gap: '16px',
      overflow: 'auto',
    }} className="scrollbar">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <VscSearch size={20} color="var(--accent-color)" />
        <h2 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>Regex Tester</h2>
        <div style={{ flex: 1 }} />
        <button onClick={clearAll} style={toolBtnStyle} title="Clear All">
          <VscTrash size={14} />
        </button>
      </div>

      {/* Pattern Input */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => handlePatternChange(e.target.value)}
            placeholder="Regular expression"
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>/</span>
          <span style={{ color: 'var(--accent-color)', fontFamily: 'monospace', minWidth: '24px' }}>{flags}</span>
        </div>
        <button onClick={copyRegex} style={toolBtnStyle} title="Copy Regex">
          <VscCopy size={14} />
        </button>
      </div>

      {/* Flags */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { flag: 'g', label: 'Global', desc: 'Find all matches' },
          { flag: 'i', label: 'Case Insensitive', desc: 'Case-insensitive matching' },
          { flag: 'm', label: 'Multiline', desc: 'Multi-line mode' },
          { flag: 's', label: 'DotAll', desc: 'Dot matches newlines' },
          { flag: 'u', label: 'Unicode', desc: 'Unicode mode' },
        ].map(({ flag, label, desc }) => (
          <button
            key={flag}
            onClick={() => toggleFlag(flag)}
            title={desc}
            style={{
              padding: '4px 8px',
              backgroundColor: flags.includes(flag) ? 'var(--accent-color)' : 'var(--bg-tertiary)',
              color: flags.includes(flag) ? 'white' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <strong>{flag}</strong>
            {label}
          </button>
        ))}
      </div>

      {/* Test String */}
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          Test String
        </label>
        <textarea
          value={testString}
          onChange={(e) => handleTestStringChange(e.target.value)}
          placeholder="Enter text to test against the regex"
          style={{
            width: '100%',
            height: '100px',
            padding: '12px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            fontFamily: 'monospace',
            fontSize: '13px',
            lineHeight: '1.5',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(244, 71, 71, 0.1)',
          border: '1px solid rgba(244, 71, 71, 0.3)',
          borderRadius: '4px',
          color: '#f44747',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
        }}>
          <VscWarning size={16} />
          {error}
        </div>
      )}

      {/* Highlighted Preview */}
      {testString && !error && (
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Highlighted Matches
          </label>
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '13px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
            dangerouslySetInnerHTML={{ __html: highlightedText || testString }}
          />
        </div>
      )}

      {/* Matches */}
      {matches.length > 0 && (
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Matches ({matches.length})
          </label>
          <div style={{
            maxHeight: '200px',
            overflow: 'auto',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
          }} className="scrollbar">
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
            }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Match</th>
                  <th style={thStyle}>Index</th>
                  <th style={thStyle}>Length</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#e5c07b' }}>"{m.match}"</td>
                    <td style={tdStyle}>{m.index}</td>
                    <td style={tdStyle}>{m.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Common Patterns */}
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          Common Patterns
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {commonPatterns.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setPattern(p.pattern);
                setTimeout(testRegex, 0);
              }}
              style={{
                padding: '4px 8px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              {p.name}
            </button>
          ))}
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

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  textAlign: 'left',
  fontWeight: 'bold',
  borderBottom: '1px solid var(--border-color)',
};

const tdStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderBottom: '1px solid var(--border-color)',
};
