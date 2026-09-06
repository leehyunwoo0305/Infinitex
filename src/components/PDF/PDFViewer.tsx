import React, { useEffect, useRef, useState } from 'react';
import { VscClose, VscZoomIn, VscZoomOut, VscChromeMinimize, VscChromeMaximize, VscArrowUp, VscArrowDown } from 'react-icons/vsc';
import { fileSystem, isElectronApp } from '../../utils/electron';

interface PDFViewerProps {
  file: string | null;
  onClose: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ file, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!file || !containerRef.current) return;
    
    const loadPDF = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Dynamic import of pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        
        let arrayBuffer: ArrayBuffer;
        
        if (isElectronApp) {
          const data = await fileSystem.readFileBuffer(file);
          arrayBuffer = new Uint8Array(data).buffer as ArrayBuffer;
        } else {
          const response = await fetch(file);
          arrayBuffer = await response.arrayBuffer();
        }
        
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setTotalPages(pdf.numPages);
        
        const container = containerRef.current;
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.style.marginBottom = '16px';
          canvas.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
          
          await page.render({
            canvasContext: context!,
            viewport,
          }).promise;
          
          container.appendChild(canvas);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load PDF');
      } finally {
        setLoading(false);
      }
    };
    
    loadPDF();
  }, [file, scale]);
  
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  
  if (!file) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📄</div>
        <div>No PDF file selected</div>
      </div>
    );
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
      <div className="toolbar" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {file.split(/[/\\]/).pop()}
        </span>
        <div style={{ flex: 1 }} />
        <button className="toolbar-button" onClick={handleZoomOut} title="Zoom Out">
          <VscZoomOut size={14} />
        </button>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '0 8px' }}>
          {Math.round(scale * 100)}%
        </span>
        <button className="toolbar-button" onClick={handleZoomIn} title="Zoom In">
          <VscZoomIn size={14} />
        </button>
        <button className="toolbar-button" onClick={onClose} title="Close">
          <VscClose size={14} />
        </button>
      </div>
      
      <div 
        ref={containerRef}
        style={{ 
          flex: 1, 
          overflow: 'auto', 
          backgroundColor: '#525659',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        className="scrollbar"
      />
      
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'var(--text-primary)',
          fontSize: '14px',
        }}>
          Loading PDF...
        </div>
      )}
      
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'var(--error-color, #f44747)',
          fontSize: '14px',
          textAlign: 'center',
        }}>
          <div>Error loading PDF</div>
          <div style={{ fontSize: '12px', marginTop: '8px', color: 'var(--text-secondary)' }}>{error}</div>
        </div>
      )}
    </div>
  );
};
