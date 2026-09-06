import React, { useState, useEffect, useCallback } from 'react';
import {
  VscMarkdown,
  VscRefresh,
  VscSplitHorizontal,
  VscWholeWord
} from 'react-icons/vsc';
import { useStore } from '../../store/useStore';
import { isElectronApp, electronAPI } from '../../utils/electron';

type PreviewMode = 'preview' | 'split' | 'source';

export const MarkdownPreview: React.FC = () => {
  const { activeFile, viewMode } = useStore();
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('split');
  const [htmlContent, setHtmlContent] = useState('');

  const loadFile = useCallback(async () => {
    if (!activeFile || !isElectronApp || !electronAPI) return;

    try {
      const result = await electronAPI.readFile(activeFile);
      if (result.success && result.content) {
        setContent(result.content);
        setHtmlContent(markdownToHtml(result.content));
      }
    } catch (error) {
      console.error('Failed to load markdown file:', error);
    }
  }, [activeFile, isElectronApp]);

  useEffect(() => {
    if (activeFile) {
      loadFile();
    }
  }, [activeFile, loadFile]);

  const markdownToHtml = (md: string): string => {
    let html = md;

    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // Bold and Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Strikethrough
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" style="max-width: 100%;" />');

    // Blockquotes
    html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr />');

    // Unordered lists
    html = html.replace(/^\s*[-*+] (.*$)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Ordered lists
    html = html.replace(/^\s*\d+\. (.*$)/gm, '<li>$1</li>');

    // Tables (simple)
    html = html.replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(Boolean).map(c => c.trim());
      if (cells.some(c => c.match(/^[-:]+$/))) return '';
      return `<tr>${cells.map(c => `<td style="border: 1px solid var(--border-color); padding: 8px;">${c}</td>`).join('')}</tr>`;
    });

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = `<p>${html}</p>`;

    // Line breaks
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHtmlContent(markdownToHtml(newContent));
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
        <VscMarkdown size={48} />
        <div style={{ marginTop: '16px' }}>Open a Markdown file to preview</div>
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
        <VscMarkdown size={16} color="#519aba" />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Markdown</span>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => setPreviewMode('source')}
          style={{
            padding: '4px 8px',
            backgroundColor: previewMode === 'source' ? 'var(--bg-tertiary)' : 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          Source
        </button>
        <button
          onClick={() => setPreviewMode('split')}
          style={{
            padding: '4px 8px',
            backgroundColor: previewMode === 'split' ? 'var(--bg-tertiary)' : 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          Split
        </button>
        <button
          onClick={() => setPreviewMode('preview')}
          style={{
            padding: '4px 8px',
            backgroundColor: previewMode === 'preview' ? 'var(--bg-tertiary)' : 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          Preview
        </button>

        <button onClick={loadFile} style={toolBtnStyle} title="Refresh">
          <VscRefresh size={14} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Source Editor */}
        {(previewMode === 'source' || previewMode === 'split') && (
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            style={{
              flex: previewMode === 'split' ? 1 : undefined,
              width: previewMode === 'source' ? '100%' : undefined,
              height: '100%',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: previewMode === 'split' ? '1px solid var(--border-color)' : 'none',
              borderRight: previewMode === 'split' ? 'none' : undefined,
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
        )}

        {/* Preview Panel */}
        {(previewMode === 'preview' || previewMode === 'split') && (
          <div
            style={{
              flex: previewMode === 'split' ? 1 : undefined,
              width: previewMode === 'preview' ? '100%' : undefined,
              height: '100%',
              overflow: 'auto',
              padding: '20px',
              backgroundColor: 'var(--bg-primary)',
              fontSize: '14px',
              lineHeight: '1.6',
              color: 'var(--text-primary)',
            }}
            className="scrollbar markdown-preview"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
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
