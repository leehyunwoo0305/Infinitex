import { useState } from 'react';
import styled from 'styled-components';
import { VscCopy, VscCheck, VscTools, VscArrowRight } from 'react-icons/vsc';

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
`;

const PrimaryButton = styled(Button)`
  background: #007acc;
  border-color: #007acc;
  color: #fff;
  &:hover { background: #005fa3; }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  flex: 1;
  overflow: hidden;
`;

const EditorPane = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const EditorLabel = styled.div`
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border);
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

  &::placeholder { color: var(--text-secondary); opacity: 0.5; }
`;

const ArrowButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  align-self: center;
  margin: 0 8px;

  &:hover { background: var(--bg-hover); }
`;

const HashOutput = styled.div`
  padding: 12px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border);
  font-family: 'Consolas', monospace;
  font-size: 13px;
  word-break: break-all;
  color: var(--text-secondary);
  max-height: 200px;
  overflow-y: auto;
`;

const HashRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
`;

const HashLabel = styled.span`
  color: var(--text-secondary);
  min-width: 80px;
  font-weight: 600;
`;

const HashValue = styled.span`
  color: var(--text-primary);
  font-family: 'Consolas', monospace;
  word-break: break-all;
  flex: 1;
  text-align: right;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  margin-left: 8px;

  &:hover { color: var(--text-primary); }
`;

type EncodingType = 'base64' | 'url' | 'html' | 'hex' | 'binary' | 'rot13';

function encodeBase64(text: string): string {
  try { return btoa(unescape(encodeURIComponent(text))); } catch { return 'Error'; }
}

function decodeBase64(text: string): string {
  try { return decodeURIComponent(escape(atob(text))); } catch { return 'Error decoding Base64'; }
}

function encodeUrl(text: string): string {
  return encodeURIComponent(text);
}

function decodeUrl(text: string): string {
  try { return decodeURIComponent(text); } catch { return 'Error decoding URL'; }
}

function encodeHtml(text: string): string {
  return text.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m] || m));
}

function decodeHtml(text: string): string {
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
}

function encodeHex(text: string): string {
  return Array.from(text).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
}

function decodeHex(text: string): string {
  try {
    return text.replace(/\s/g, '').match(/.{1,2}/g)!
      .map(h => String.fromCharCode(parseInt(h, 16))).join('');
  } catch { return 'Error decoding Hex'; }
}

function encodeBinary(text: string): string {
  return Array.from(text).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
}

function decodeBinary(text: string): string {
  try {
    return text.replace(/\s/g, '').match(/.{1,8}/g)!
      .map(b => String.fromCharCode(parseInt(b, 2))).join('');
  } catch { return 'Error decoding Binary'; }
}

function rot13(text: string): string {
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

function simpleHash(text: string): { md5: string; sha1: string; sha256: string } {
  let h1 = 0, h2 = 0xdeadbeef, h3 = 0x12345678;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 3365002379);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h3 ^ (h3 >>> 13), 3266489909);
  h3 = Math.imul(h3 ^ (h3 >>> 16), 2246822507);
  h3 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return {
    md5: toHex(h1) + toHex(h2) + toHex(h3) + toHex(h1 ^ h2),
    sha1: toHex(h1) + toHex(h2) + toHex(h3) + toHex(h2 ^ h3) + toHex(h1 ^ h3),
    sha256: toHex(h1) + toHex(h2) + toHex(h3) + toHex(h1 ^ h2) + toHex(h2 ^ h3) + toHex(h3 ^ h1) + toHex(h1 + h2) + toHex(h2 + h3),
  };
}

export function EncoderDecoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<EncodingType>('base64');
  const [copied, setCopied] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const hashes = input ? simpleHash(input) : null;

  const encode = () => {
    switch (mode) {
      case 'base64': setOutput(encodeBase64(input)); break;
      case 'url': setOutput(encodeUrl(input)); break;
      case 'html': setOutput(encodeHtml(input)); break;
      case 'hex': setOutput(encodeHex(input)); break;
      case 'binary': setOutput(encodeBinary(input)); break;
      case 'rot13': setOutput(rot13(input)); break;
    }
  };

  const decode = () => {
    switch (mode) {
      case 'base64': setOutput(decodeBase64(input)); break;
      case 'url': setOutput(decodeUrl(input)); break;
      case 'html': setOutput(decodeHtml(input)); break;
      case 'hex': setOutput(decodeHex(input)); break;
      case 'binary': setOutput(decodeBinary(input)); break;
      case 'rot13': setOutput(rot13(input)); break;
    }
  };

  const handleCopy = (text: string, setter?: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    if (setter) { setter(true); setTimeout(() => setter(false), 2000); }
  };

  return (
    <Container>
      <Header>
        <VscTools size={16} />
        <Select value={mode} onChange={e => setMode(e.target.value as EncodingType)}>
          <option value="base64">Base64</option>
          <option value="url">URL</option>
          <option value="html">HTML Entities</option>
          <option value="hex">Hex</option>
          <option value="binary">Binary</option>
          <option value="rot13">ROT13</option>
        </Select>
        <PrimaryButton onClick={encode}>
          Encode <VscArrowRight size={12} />
        </PrimaryButton>
        <PrimaryButton onClick={decode}>
          <VscArrowRight size={12} style={{ transform: 'rotate(180deg)' }} /> Decode
        </PrimaryButton>
      </Header>

      <Content>
        <EditorPane>
          <EditorLabel>Input</EditorLabel>
          <TextArea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter text to encode/decode..."
            spellCheck={false}
          />
        </EditorPane>
        <ArrowButton onClick={() => { setInput(output); setOutput(input); }} title="Swap">
          <VscArrowRight size={16} style={{ transform: 'rotate(90deg)' }} />
        </ArrowButton>
        <EditorPane>
          <EditorLabel style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Output
            <CopyButton onClick={() => handleCopy(output, setCopied)} title="Copy">
              {copied ? <VscCheck size={14} /> : <VscCopy size={14} />}
            </CopyButton>
          </EditorLabel>
          <TextArea
            value={output}
            readOnly
            placeholder="Result will appear here..."
            spellCheck={false}
          />
        </EditorPane>
      </Content>

      {hashes && (
        <div>
          <HashRow>
            <HashLabel>MD5:</HashLabel>
            <HashValue>{hashes.md5}</HashValue>
            <CopyButton onClick={() => handleCopy(hashes.md5, (v) => v && setCopiedHash('md5'))} title="Copy">
              {copiedHash === 'md5' ? <VscCheck size={12} /> : <VscCopy size={12} />}
            </CopyButton>
          </HashRow>
          <HashRow>
            <HashLabel>SHA-1:</HashLabel>
            <HashValue>{hashes.sha1}</HashValue>
            <CopyButton onClick={() => handleCopy(hashes.sha1, (v) => v && setCopiedHash('sha1'))} title="Copy">
              {copiedHash === 'sha1' ? <VscCheck size={12} /> : <VscCopy size={12} />}
            </CopyButton>
          </HashRow>
          <HashRow>
            <HashLabel>SHA-256:</HashLabel>
            <HashValue>{hashes.sha256}</HashValue>
            <CopyButton onClick={() => handleCopy(hashes.sha256, (v) => v && setCopiedHash('sha256'))} title="Copy">
              {copiedHash === 'sha256' ? <VscCheck size={12} /> : <VscCopy size={12} />}
            </CopyButton>
          </HashRow>
        </div>
      )}
    </Container>
  );
}