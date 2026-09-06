import { useState, useEffect, useRef } from 'react';
import { VscRefresh } from 'react-icons/vsc';
import { useStore } from '../../store/useStore';

export const LivePreview: React.FC = () => {
  const { files, openTabs, activeTabId } = useStore();
  const [previewContent, setPreviewContent] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const activeTab = openTabs.find(tab => tab.id === activeTabId);
  const activeFile = activeTab ? files.find(file => file.id === activeTab.fileId) : null;
  
  useEffect(() => {
    if (!activeFile) return;
    
    const generatePreview = () => {
      const content = activeFile.content || '';
      const language = activeFile.language || '';
      
      if (language === 'html') {
        return content;
      }
      
      if (language === 'css') {
        return `
<!DOCTYPE html>
<html>
<head>
  <style>${content}</style>
</head>
<body>
  <div class="preview-container">
    <p>CSS Preview</p>
  </div>
</body>
</html>`;
      }
      
      if (language === 'javascript' || language === 'typescript') {
        return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: monospace; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
    .output { margin: 10px 0; padding: 10px; background: #2d2d2d; border-radius: 4px; }
    .error { color: #f44747; }
    .log { color: #d4d4d4; }
    .warn { color: #dcdcaa; }
    .info { color: #4ec9b0; }
  </style>
</head>
<body>
  <div id="output"></div>
  <script>
    const output = document.getElementById('output');
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;
    
    console.log = (...args) => {
      originalLog(...args);
      const div = document.createElement('div');
      div.className = 'output log';
      div.textContent = args.join(' ');
      output.appendChild(div);
    };
    
    console.error = (...args) => {
      originalError(...args);
      const div = document.createElement('div');
      div.className = 'output error';
      div.textContent = args.join(' ');
      output.appendChild(div);
    };
    
    console.warn = (...args) => {
      originalWarn(...args);
      const div = document.createElement('div');
      div.className = 'output warn';
      div.textContent = args.join(' ');
      output.appendChild(div);
    };
    
    console.info = (...args) => {
      originalInfo(...args);
      const div = document.createElement('div');
      div.className = 'output info';
      div.textContent = args.join(' ');
      output.appendChild(div);
    };
    
    try {
      ${content}
    } catch (e) {
      console.error(e.message);
    }
  </script>
</body>
</html>`;
      }
      
      return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: monospace; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
    .preview { text-align: center; padding: 40px; }
  </style>
</head>
<body>
  <div class="preview">
    <h2>Preview</h2>
    <p>File type: ${language || 'unknown'}</p>
  </div>
</body>
</html>`;
    };
    
    setPreviewContent(generatePreview());
  }, [activeFile]);
  
  useEffect(() => {
    if (iframeRef.current && previewContent) {
      const blob = new Blob([previewContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;
      
      return () => URL.revokeObjectURL(url);
    }
  }, [previewContent]);
  
  const handleRefresh = () => {
    if (activeFile) {
      const content = activeFile.content || '';
      setPreviewContent(content);
    }
  };
  
  return (
    <div className="preview-panel">
      <div className="toolbar">
        <span style={{ fontSize: '12px', color: '#858585' }}>Live Preview</span>
        <div style={{ flex: 1 }} />
        <button className="toolbar-button" onClick={handleRefresh} title="Refresh">
          <VscRefresh size={14} />
        </button>
      </div>
      
      <iframe
        ref={iframeRef}
        className="preview-frame"
        title="Live Preview"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};