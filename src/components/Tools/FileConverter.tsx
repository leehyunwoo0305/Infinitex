import React, { useState } from 'react';
import {
  VscFile,
  VscArrowRight,
  VscCheck,
  VscWarning,
  VscRefresh,
  VscTrash,
  VscClose
} from 'react-icons/vsc';
import { useStore } from '../../store/useStore';
import { isElectronApp, electronAPI } from '../../utils/electron';

type ConversionType = 
  | 'json-yaml' | 'yaml-json'
  | 'csv-json' | 'json-csv'
  | 'xml-json' | 'json-xml'
  | 'markdown-html' | 'html-markdown'
  | 'javascript-typescript' | 'typescript-javascript'
  | 'css-scss' | 'scss-css'
  | 'markdown-pdf';

interface ConversionOption {
  id: ConversionType;
  name: string;
  from: string;
  to: string;
  category: 'data' | 'web' | 'code' | 'document' | 'image';
}

const CONVERSION_OPTIONS: ConversionOption[] = [
  // Data formats
  { id: 'json-yaml', name: 'JSON → YAML', from: 'JSON', to: 'YAML', category: 'data' },
  { id: 'yaml-json', name: 'YAML → JSON', from: 'YAML', to: 'JSON', category: 'data' },
  { id: 'csv-json', name: 'CSV → JSON', from: 'CSV', to: 'JSON', category: 'data' },
  { id: 'json-csv', name: 'JSON → CSV', from: 'JSON', to: 'CSV', category: 'data' },
  { id: 'xml-json', name: 'XML → JSON', from: 'XML', to: 'JSON', category: 'data' },
  { id: 'json-xml', name: 'JSON → XML', from: 'JSON', to: 'XML', category: 'data' },
  
  // Web formats
  { id: 'markdown-html', name: 'Markdown → HTML', from: 'Markdown', to: 'HTML', category: 'web' },
  { id: 'html-markdown', name: 'HTML → Markdown', from: 'HTML', to: 'Markdown', category: 'web' },
  { id: 'css-scss', name: 'CSS → SCSS', from: 'CSS', to: 'SCSS', category: 'web' },
  { id: 'scss-css', name: 'SCSS → CSS', from: 'SCSS', to: 'CSS', category: 'web' },
  
  // Code formats
  { id: 'javascript-typescript', name: 'JS → TS (typing)', from: 'JavaScript', to: 'TypeScript', category: 'code' },
  { id: 'typescript-javascript', name: 'TS → JS', from: 'TypeScript', to: 'JavaScript', category: 'code' },
  
  // Document formats
  { id: 'markdown-pdf', name: 'Markdown → HTML (for PDF)', from: 'Markdown', to: 'HTML', category: 'document' },
];

export const FileConverter: React.FC = () => {
  const { activeFile, activeTabId, openTabs } = useStore();
  const [selectedConversion, setSelectedConversion] = useState<ConversionType | null>(null);
  const [inputContent, setInputContent] = useState('');
  const [outputContent, setOutputContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadFileContent = async () => {
    if (!activeFile || !isElectronApp || !electronAPI) return;

    try {
      const result = await electronAPI.readFile(activeFile);
      if (result.success && result.content) {
        setInputContent(result.content);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const convert = async () => {
    if (!selectedConversion || !inputContent) return;

    setLoading(true);
    setError(null);

    try {
      let result = '';

      switch (selectedConversion) {
        case 'json-yaml':
          result = jsonToYaml(JSON.parse(inputContent));
          break;
        case 'yaml-json':
          result = JSON.stringify(yamlToJson(inputContent), null, 2);
          break;
        case 'csv-json':
          result = csvToJson(inputContent);
          break;
        case 'json-csv':
          result = jsonToCsv(JSON.parse(inputContent));
          break;
        case 'xml-json':
          result = xmlToJson(inputContent);
          break;
        case 'json-xml':
          result = jsonToXml(JSON.parse(inputContent));
          break;
        case 'markdown-html':
          result = markdownToHtml(inputContent);
          break;
        case 'html-markdown':
          result = htmlToMarkdown(inputContent);
          break;
        case 'css-scss':
          result = cssToScss(inputContent);
          break;
        case 'scss-css':
          result = scssToCss(inputContent);
          break;
        case 'javascript-typescript':
          result = jsToTs(inputContent);
          break;
        case 'typescript-javascript':
          result = tsToJs(inputContent);
          break;
        case 'markdown-pdf':
          result = markdownToHtml(inputContent);
          break;
        default:
          throw new Error('Unsupported conversion');
      }

      setOutputContent(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveOutput = async () => {
    if (!activeFile || !outputContent || !isElectronApp || !electronAPI) return;

    const ext = activeFile.split('.').pop();
    const newExt = getOutputExtension(selectedConversion!);
    const newFileName = activeFile.replace(`.${ext}`, `.${newExt}`);

    try {
      await electronAPI.writeFile(newFileName, outputContent);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputContent);
  };

  // Conversion functions
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

  const csvToJson = (csv: string): string => {
    const lines = csv.split('\n').filter(Boolean);
    if (lines.length < 2) return '[]';

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: any = {};
      headers.forEach((h, i) => {
        obj[h] = isNaN(Number(values[i])) ? values[i] : Number(values[i]);
      });
      return obj;
    });

    return JSON.stringify(rows, null, 2);
  };

  const jsonToCsv = (arr: any[]): string => {
    if (!Array.isArray(arr) || arr.length === 0) return '';

    const headers = Object.keys(arr[0]);
    const rows = arr.map(obj => headers.map(h => obj[h] ?? '').join(','));
    return [headers.join(','), ...rows].join('\n');
  };

  const xmlToJson = (xml: string): string => {
    // Simple XML to JSON conversion
    const result: any = {};
    const matches = xml.matchAll(/<(\w+)(?:\s[^>]*)?>([^<]*)<\/\1>/g);
    
    for (const match of matches) {
      const [, key, value] = match;
      if (!isNaN(Number(value))) {
        result[key] = Number(value);
      } else if (value === 'true') {
        result[key] = true;
      } else if (value === 'false') {
        result[key] = false;
      } else {
        result[key] = value;
      }
    }

    return JSON.stringify(result, null, 2);
  };

  const jsonToXml = (obj: any, indent: number = 0): string => {
    let xml = '';
    const prefix = '  '.repeat(indent);

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        xml += `${prefix}<${key}>\n${jsonToXml(value, indent + 1)}${prefix}</${key}>\n`;
      } else {
        xml += `${prefix}<${key}>${value}</${key}>\n`;
      }
    }

    return xml;
  };

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

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = `<p>${html}</p>`;

    return html;
  };

  const htmlToMarkdown = (html: string): string => {
    let md = html;

    // Headers
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');

    // Bold and Italic
    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');

    // Code
    md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '```\n$1\n```');

    // Links
    md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

    // Images
    md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, '![$1]($2)');

    // Paragraphs
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

    // Remove other tags
    md = md.replace(/<[^>]+>/g, '');

    return md.trim();
  };

  const cssToScss = (css: string): string => {
    // Simple CSS to SCSS conversion
    return css.replace(/(\w+[^{]*)\{/g, '$1 {');
  };

  const scssToCss = (scss: string): string => {
    // Simple SCSS to CSS conversion
    return scss;
  };

  const jsToTs = (js: string): string => {
    // Simple JS to TS conversion - add basic types
    let ts = js;

    // Convert function declarations
    ts = ts.replace(/function\s+(\w+)\s*\(([^)]*)\)/g, (match, name, params) => {
      const typedParams = params.split(',').map((p: string) => {
        const [paramName] = p.trim().split(':');
        return `${paramName}: any`;
      }).join(', ');
      return `function ${name}(${typedParams}): any`;
    });

    // Convert const/let/var
    ts = ts.replace(/(const|let|var)\s+(\w+)\s*=/g, '$1 $2: any =');

    return ts;
  };

  const tsToJs = (ts: string): string => {
    // Simple TS to JS conversion - remove types
    let js = ts;

    // Remove type annotations
    js = js.replace(/:\s*any/g, '');
    js = js.replace(/:\s*string/g, '');
    js = js.replace(/:\s*number/g, '');
    js = js.replace(/:\s*boolean/g, '');
    js = js.replace(/<[^>]+>/g, '');

    // Remove return types
    js = js.replace(/\)\s*:\s*\w+/g, ')');

    return js;
  };

  const getOutputExtension = (conversion: ConversionType): string => {
    const extMap: Record<ConversionType, string> = {
      'json-yaml': 'yaml',
      'yaml-json': 'json',
      'csv-json': 'json',
      'json-csv': 'csv',
      'xml-json': 'json',
      'json-xml': 'xml',
      'markdown-html': 'html',
      'html-markdown': 'md',
      'css-scss': 'scss',
      'scss-css': 'css',
      'javascript-typescript': 'ts',
      'typescript-javascript': 'js',
      'markdown-pdf': 'html',
    };
    return extMap[conversion];
  };

  const categories = ['data', 'web', 'code', 'document'] as const;

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
        <VscFile size={20} color="var(--accent-color)" />
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          File Converter
        </span>
        <div style={{ flex: 1 }} />
        <button onClick={loadFileContent} style={toolBtnStyle} title="Load Active File">
          <VscRefresh size={14} />
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar - Conversion Options */}
        <div style={{
          width: '200px',
          borderRight: '1px solid var(--border-color)',
          overflow: 'auto',
        }} className="scrollbar">
          {categories.map(category => (
            <div key={category}>
              <div style={{
                padding: '8px 12px',
                fontSize: '11px',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-tertiary)',
              }}>
                {category}
              </div>
              {CONVERSION_OPTIONS.filter(opt => opt.category === category).map(option => (
                <div
                  key={option.id}
                  onClick={() => setSelectedConversion(option.id)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    backgroundColor: selectedConversion === option.id ? 'var(--bg-tertiary)' : 'transparent',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                    {option.from}
                  </span>
                  <VscArrowRight size={10} color="var(--text-secondary)" />
                  <span style={{ fontSize: '12px', color: 'var(--accent-color)' }}>
                    {option.to}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selectedConversion ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
            }}>
              <VscFile size={48} />
              <div style={{ marginTop: '16px' }}>Select a conversion type</div>
            </div>
          ) : (
            <>
              {/* Input/Output Panels */}
              <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Input */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-color)' }}>
                  <div style={{
                    padding: '8px 12px',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                    borderBottom: '1px solid var(--border-color)',
                  }}>
                    Input ({CONVERSION_OPTIONS.find(o => o.id === selectedConversion)?.from})
                  </div>
                  <textarea
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    placeholder="Paste or load content here..."
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      border: 'none',
                      fontFamily: "'Consolas', 'Monaco', monospace",
                      fontSize: '13px',
                      lineHeight: '1.5',
                      resize: 'none',
                      outline: 'none',
                    }}
                    spellCheck={false}
                  />
                </div>

                {/* Output */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    padding: '8px 12px',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                    <span>Output ({CONVERSION_OPTIONS.find(o => o.id === selectedConversion)?.to})</span>
                    {outputContent && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={copyToClipboard} style={{ ...toolBtnStyle, width: 'auto', padding: '0 8px', fontSize: '10px' }}>
                          Copy
                        </button>
                        <button onClick={saveOutput} style={{ ...toolBtnStyle, width: 'auto', padding: '0 8px', fontSize: '10px' }}>
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                  <textarea
                    value={outputContent}
                    readOnly
                    placeholder="Converted output will appear here..."
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      border: 'none',
                      fontFamily: "'Consolas', 'Monaco', monospace",
                      fontSize: '13px',
                      lineHeight: '1.5',
                      resize: 'none',
                      outline: 'none',
                    }}
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: 'rgba(244, 71, 71, 0.1)',
                  borderTop: '1px solid rgba(244, 71, 71, 0.3)',
                  color: '#f44747',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                }}>
                  <VscWarning size={14} />
                  {error}
                </div>
              )}

              {/* Convert Button */}
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'center',
              }}>
                <button
                  onClick={convert}
                  disabled={loading || !inputContent}
                  style={{
                    padding: '10px 32px',
                    backgroundColor: inputContent ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                    color: inputContent ? 'white' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: inputContent ? 'pointer' : 'not-allowed',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <VscArrowRight size={14} />
                  {loading ? 'Converting...' : 'Convert'}
                </button>
              </div>
            </>
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
