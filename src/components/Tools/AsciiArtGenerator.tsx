import { useState } from 'react';
import styled from 'styled-components';
import { VscCopy, VscCheck, VscTools, VscRefresh } from 'react-icons/vsc';

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

const Input = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ArtDisplay = styled.pre`
  flex: 1;
  padding: 16px;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.2;
  overflow: auto;
  white-space: pre;
  background: var(--bg-primary);
  color: var(--text-primary);
`;

const PresetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
`;

const PresetButton = styled.button`
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 12px;
  text-align: center;
  transition: background 0.15s;

  &:hover { background: var(--bg-hover); border-color: #007acc; }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
  font-size: 12px;
  color: var(--text-secondary);
`;

const charMaps: Record<string, string[]> = {
  standard: ['@', '#', 'S', '%', '?', '*', '+', ';', ':', ',', '.', ' '],
  blocks: ['█', '▓', '▒', '░', '═', '║', '╬', '╫', '╪', '╩', '╦', ' ' ],
  simple: ['#', '*', '+', '-', '.', ' '],
  binary: ['1', '0'],
  dots: ['●', '○', '◎', '◉', '•', ' '],
  noise: ['.', ',', ':', ';', "'", '`', '^', '"', '~', '*', '+', '-', ' '],
};

function textToAscii(text: string, charSet: string): string {
  const chars = charMaps[charSet] || charMaps.standard;
  const lines: string[] = [];
  const maxLen = 50;
  
  const upper = text.toUpperCase();
  
  // Simple bitmap-like mapping
  const bitmap: Record<string, string[]> = {
    'A': ['  █  ', ' █ █ ', '█████', '█   █', '█   █'],
    'B': ['████ ', '█   █', '████ ', '█   █', '████ '],
    'C': [' ████', '█    ', '█    ', '█    ', ' ████'],
    'D': ['████ ', '█   █', '█   █', '█   █', '████ '],
    'E': ['█████', '█    ', '████ ', '█    ', '█████'],
    'F': ['█████', '█    ', '████ ', '█    ', '█    '],
    'G': [' ████', '█    ', '█  ██', '█   █', ' ████'],
    'H': ['█   █', '█   █', '█████', '█   █', '█   █'],
    'I': ['█████', '  █  ', '  █  ', '  █  ', '█████'],
    'J': ['█████', '    █', '    █', '█   █', ' ████'],
    'K': ['█   █', '█  █ ', '███  ', '█  █ ', '█   █'],
    'L': ['█    ', '█    ', '█    ', '█    ', '█████'],
    'M': ['█   █', '██ ██', '█ █ █', '█   █', '█   █'],
    'N': ['█   █', '██  █', '█ █ █', '█  ██', '█   █'],
    'O': [' ███ ', '█   █', '█   █', '█   █', ' ███ '],
    'P': ['████ ', '█   █', '████ ', '█    ', '█    '],
    'Q': [' ███ ', '█   █', '█ █ █', '█  █ ', ' ██ █'],
    'R': ['████ ', '█   █', '████ ', '█  █ ', '█   █'],
    'S': [' ████', '█    ', ' ███ ', '    █', '████ '],
    'T': ['█████', '  █  ', '  █  ', '  █  ', '  █  '],
    'U': ['█   █', '█   █', '█   █', '█   █', ' ███ '],
    'V': ['█   █', '█   █', '█   █', ' █ █ ', '  █  '],
    'W': ['█   █', '█   █', '█ █ █', '██ ██', '█   █'],
    'X': ['█   █', ' █ █ ', '  █  ', ' █ █ ', '█   █'],
    'Y': ['█   █', ' █ █ ', '  █  ', '  █  ', '  █  '],
    'Z': ['█████', '   █ ', '  █  ', ' █   ', '█████'],
    '0': [' ███ ', '█  ██', '█ █ █', '██  █', ' ███ '],
    '1': ['  █  ', ' ██  ', '  █  ', '  █  ', '█████'],
    '2': [' ███ ', '█   █', '  ██ ', ' █   ', '█████'],
    '3': ['████ ', '    █', ' ███ ', '    █', '████ '],
    '4': ['█   █', '█   █', '█████', '    █', '    █'],
    '5': ['█████', '█    ', '████ ', '    █', '████ '],
    '6': [' ████', '█    ', '████ ', '█   █', ' ███ '],
    '7': ['█████', '    █', '   █ ', '  █  ', '  █  '],
    '8': [' ███ ', '█   █', ' ███ ', '█   █', ' ███ '],
    '9': [' ███ ', '█   █', ' ████', '    █', '████ '],
    ' ': ['     ', '     ', '     ', '     ', '     '],
    '!': ['  █  ', '  █  ', '  █  ', '     ', '  █  '],
    '?': [' ███ ', '█   █', '  ██ ', '     ', '  █  '],
  };

  const letterWidth = 5;
  const letterHeight = 5;
  const maxWidth = maxLen * (letterWidth + 1);
  
  const rows: string[][] = Array.from({ length: letterHeight }, () => Array(maxWidth).fill(' '));
  
  let x = 0;
  for (const ch of upper.slice(0, maxLen)) {
    const bmp = bitmap[ch] || bitmap[' '];
    for (let row = 0; row < letterHeight; row++) {
      for (let col = 0; col < letterWidth; col++) {
        if (bmp[row] && bmp[row][col] === '█') {
          rows[row][x + col] = chars[0];
        } else if (bmp[row] && bmp[row][col] !== ' ') {
          rows[row][x + col] = chars[Math.floor(chars.length / 2)];
        }
      }
    }
    x += letterWidth + 1;
  }

  return rows.map(row => row.join('').trimEnd()).join('\n');
}

function generateDecoration(text: string, style: string): string {
  const width = text.length + 4;
  const border = '═'.repeat(width);
  
  switch (style) {
    case 'box':
      return `╔${border}╗\n║  ${text}  ║\n╚${border}╝`;
    case 'circle':
      return `  ╭${'─'.repeat(width)}╮\n  │  ${text}  │\n  ╰${'─'.repeat(width)}╯`;
    case 'star':
      const stars = '★'.repeat(width + 4);
      return `${stars}\n★  ${' '.repeat(width)}  ★\n★    ${text}    ★\n★  ${' '.repeat(width)}  ★\n${stars}`;
    case 'banner':
      return `┌${'─'.repeat(width)}┐\n│${'─'.repeat(width)}│\n│  ${text.padEnd(width - 2)}│\n│${'─'.repeat(width)}│\n└${'─'.repeat(width)}┘`;
    case 'wave':
      return `～～～～～～～～～\n  ♪ ${text} ♪\n～～～～～～～～～`;
    default:
      return `[ ${text} ]`;
  }
}

export function AsciiArtGenerator() {
  const [text, setText] = useState('HELLO');
  const [charSet, setCharSet] = useState('standard');
  const [style, setStyle] = useState('ascii');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    if (style === 'ascii') {
      setOutput(textToAscii(text, charSet));
    } else {
      setOutput(generateDecoration(text, style));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = ['HELLO', 'WORLD', 'CODING', 'INFNITEX', 'DEVELOPER', 'OPEN SOURCE'];

  return (
    <Container>
      <Header>
        <VscTools size={16} />
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Enter text..."
          maxLength={50}
        />
        <Select value={style} onChange={e => setStyle(e.target.value)}>
          <option value="ascii">ASCII Text</option>
          <option value="box">Box Border</option>
          <option value="circle">Circle</option>
          <option value="star">Stars</option>
          <option value="banner">Banner</option>
          <option value="wave">Wave</option>
        </Select>
        {style === 'ascii' && (
          <Select value={charSet} onChange={e => setCharSet(e.target.value)}>
            {Object.keys(charMaps).map(k => (
              <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>
            ))}
          </Select>
        )}
        <PrimaryButton onClick={generate}>
          <VscRefresh size={14} /> Generate
        </PrimaryButton>
        <Button onClick={handleCopy} disabled={!output}>
          {copied ? <VscCheck size={14} /> : <VscCopy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </Header>

      <Content>
        <ArtDisplay>{output || 'Click "Generate" to create ASCII art...'}</ArtDisplay>
      </Content>

      <PresetGrid>
        {presets.map(p => (
          <PresetButton key={p} onClick={() => { setText(p); }}>
            {p}
          </PresetButton>
        ))}
      </PresetGrid>

      <Footer>
        <span>{output.split('\n').length} lines</span>
        <span>{output.length} characters</span>
      </Footer>
    </Container>
  );
}