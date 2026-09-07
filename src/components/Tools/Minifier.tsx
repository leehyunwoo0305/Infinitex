import { useState } from 'react';
import styled from 'styled-components';
import { VscCopy, VscCheck, VscChevronDown, VscChevronRight, VscRunErrors, VscTools } from 'react-icons/vsc';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
  color: var(--text-primary);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
`;

const Select = styled.select`
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 13px;
  transition: background 0.15s;

  &:hover { background: var(--bg-hover); }
  &:active { background: var(--bg-active); }
`;

const PrimaryButton = styled(Button)`
  background: #007acc;
  border-color: #007acc;
  color: #fff;
  &:hover { background: #005fa3; }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  flex: 1;
  overflow: hidden;
`;

const EditorPane = styled.div`
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
`;

const EditorLabel = styled.div`
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TextArea = styled.textarea`
  flex: 1;
  padding: 12px;
  border: none;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Consolas', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: none;
  outline: none;
  tab-size: 2;

  &::placeholder { color: var(--text-secondary); opacity: 0.5; }
`;

const Options = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border);
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;

  input { cursor: pointer; }
`;

const Stats = styled.div`
  padding: 8px 16px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  font-size: 11px;
  color: var(--text-secondary);
  display: flex;
  gap: 16px;
`;

function minifyHtml(code: string, opts: { removeComments: boolean; removeWhitespace: boolean }): string {
  let result = code;
  if (opts.removeComments) {
    result = result.replace(/<!--[\s\S]*?-->/g, '');
  }
  if (opts.removeWhitespace) {
    result = result.replace(/>\s+</g, '><');
    result = result.replace(/\s{2,}/g, ' ');
  }
  return result.trim();
}

function beautifyHtml(code: string): string {
  let result = code;
  result = result.replace(/>\s*</g, '>\n<');
  const lines = result.split('\n');
  let indent = 0;
  const formatted = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('</')) indent = Math.max(0, indent - 1);
    const prefix = '  '.repeat(indent);
    if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.startsWith('<!--')) {
      indent++;
    }
    return prefix + trimmed;
  });
  return formatted.filter(l => l !== '').join('\n');
}

function minifyCss(code: string, opts: { removeComments: boolean; removeWhitespace: boolean }): string {
  let result = code;
  if (opts.removeComments) {
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
  }
  if (opts.removeWhitespace) {
    result = result.replace(/\s{2,}/g, ' ');
    result = result.replace(/\s*([{}:;,])\s*/g, '$1');
  }
  return result.trim();
}

function beautifyCss(code: string): string {
  let result = code;
  result = result.replace(/([{}:;,])\s*/g, '$1\n');
  result = result.replace(/\{\n/g, ' {\n');
  let indent = 0;
  const lines = result.split('\n');
  return lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed === '}') indent = Math.max(0, indent - 1);
    const prefix = '  '.repeat(indent);
    if (trimmed.endsWith('{')) indent++;
    return prefix + trimmed;
  }).filter(l => l !== '').join('\n');
}

function minifyJs(code: string, opts: { removeComments: boolean; removeWhitespace: boolean }): string {
  let result = code;
  if (opts.removeComments) {
    result = result.replace(/\/\/.*$/gm, '');
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
  }
  if (opts.removeWhitespace) {
    result = result.replace(/\s{2,}/g, ' ');
    result = result.replace(/\s*([{}();,=+\-<>!&|?:])\s*/g, '$1');
  }
  return result.trim();
}

function beautifyJs(code: string): string {
  let result = code;
  result = result.replace(/;/g, ';\n');
  result = result.replace(/\{/g, ' {\n');
  result = result.replace(/\}/g, '\n}\n');
  let indent = 0;
  const lines = result.split('\n');
  return lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed === '}') indent = Math.max(0, indent - 1);
    const prefix = '  '.repeat(indent);
    if (trimmed.endsWith('{')) indent++;
    return prefix + trimmed;
  }).filter(l => l !== '').join('\n');
}

type Mode = 'html' | 'css' | 'js';
type Action = 'minify' | 'beautify';

export function Minifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<Mode>('html');
  const [action, setAction] = useState<Action>('minify');
  const [removeComments, setRemoveComments] = useState(true);
  const [removeWhitespace, setRemoveWhitespace] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const process = () => {
    setError(null);
    try {
      let result = '';
      const opts = { removeComments, removeWhitespace };

      if (action === 'minify') {
        switch (mode) {
          case 'html': result = minifyHtml(input, opts); break;
          case 'css': result = minifyCss(input, opts); break;
          case 'js': result = minifyJs(input, opts); break;
        }
      } else {
        switch (mode) {
          case 'html': result = beautifyHtml(input); break;
          case 'css': result = beautifyCss(input); break;
          case 'js': result = beautifyJs(input); break;
        }
      }

      setOutput(result);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const savings = input ? Math.round((1 - output.length / input.length) * 100) : 0;

  return (
    <Container>
      <Header>
        <VscTools size={16} />
        <Select value={mode} onChange={e => setMode(e.target.value as Mode)}>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="js">JavaScript</option>
        </Select>
        <Select value={action} onChange={e => setAction(e.target.value as Action)}>
          <option value="minify">Minify</option>
          <option value="beautify">Beautify</option>
        </Select>
        <PrimaryButton onClick={process}>
          <VscTools size={14} /> Process
        </PrimaryButton>
        <Button onClick={handleCopy} disabled={!output}>
          {copied ? <VscCheck size={14} /> : <VscCopy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </Header>

      <Options>
        <Checkbox>
          <input type="checkbox" checked={removeComments} onChange={e => setRemoveComments(e.target.checked)} />
          Remove Comments
        </Checkbox>
        <Checkbox>
          <input type="checkbox" checked={removeWhitespace} onChange={e => setRemoveWhitespace(e.target.checked)} />
          Remove Whitespace
        </Checkbox>
      </Options>

      <Content>
        <EditorPane>
          <EditorLabel>
            Input ({input.split('\n').length} lines)
          </EditorLabel>
          <TextArea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Paste your ${mode.toUpperCase()} code here...`}
            spellCheck={false}
          />
        </EditorPane>
        <EditorPane>
          <EditorLabel>
            Output ({output.split('\n').length} lines)
          </EditorLabel>
          <TextArea
            value={output}
            readOnly
            placeholder="Processed output will appear here..."
            spellCheck={false}
          />
        </EditorPane>
      </Content>

      <Stats>
        <span>Input: {input.length.toLocaleString()} chars</span>
        <span>Output: {output.length.toLocaleString()} chars</span>
        {input && <span>Savings: {savings}%</span>}
        {error && <span style={{ color: '#f44' }}>{error}</span>}
      </Stats>
    </Container>
  );
}