import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { VscCopy, VscCheck, VscTools, VscDownload, VscLink } from 'react-icons/vsc';

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
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 16px;
`;

const QRCanvas = styled.canvas`
  border: 1px solid var(--border);
  border-radius: 8px;
  background: white;
  padding: 16px;
  max-width: 100%;
`;

const SizeButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const SizeButton = styled.button<{ $active?: boolean }>`
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: ${p => p.$active ? '#007acc' : 'var(--bg-primary)'};
  color: ${p => p.$active ? 'white' : 'var(--text-primary)'};
  cursor: pointer;
  font-size: 12px;

  &:hover { background: ${p => p.$active ? '#005fa3' : 'var(--bg-hover)'}; }
`;

const Info = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  max-width: 400px;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
`;

function drawQR(canvas: HTMLCanvasElement, data: string, size: number) {
  const ctx = canvas.getContext('2d')!;
  const modules = generateQRMatrix(data);
  const moduleCount = modules.length;
  const cellSize = size / (moduleCount + 8);
  const offset = cellSize * 4;

  canvas.width = size;
  canvas.height = size;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#000000';
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) {
        ctx.fillRect(offset + col * cellSize, offset + row * cellSize, cellSize, cellSize);
      }
    }
  }
}

function generateQRMatrix(text: string): boolean[][] {
  const len = text.length;
  const size = Math.max(21, Math.ceil(Math.sqrt(len * 4)) + 21);
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Finder patterns
  const drawFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          if (row + r < size && col + c < size) matrix[row + r][col + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Data encoding
  const bits: boolean[] = [];
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    for (let b = 7; b >= 0; b--) {
      bits.push((charCode >> b) & 1 ? true : false);
    }
  }

  // Fill data into matrix
  let bitIndex = 0;
  let col = size - 1;
  let direction = -1;

  while (col >= 0) {
    if (col === 6) col--;

    for (let i = 0; i < size; i++) {
      const row = direction === -1 ? size - 1 - i : i;
      if (!matrix[row][col]) {
        if (bitIndex < bits.length) {
          matrix[row][col] = bits[bitIndex++];
        }
      }
      if (!matrix[row][col - 1] && col > 0) {
        // skip reserved
      }
    }
    col -= 2;
    direction *= -1;
  }

  // Simple mask
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r + c) % 2 === 0) {
        matrix[r][c] = !matrix[r][c];
      }
    }
  }

  return matrix;
}

export function QRCodeGenerator() {
  const [text, setText] = useState('https://github.com/leehyunwoo0305/Infinitex');
  const [qrSize, setQrSize] = useState(300);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (text) generate();
  }, [text, qrSize]);

  const generate = () => {
    if (!canvasRef.current || !text) return;
    drawQR(canvasRef.current, text, qrSize);
    setGenerated(true);
  };

  const download = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const copyImage = async () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(blob => {
      if (blob) {
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      }
    });
  };

  return (
    <Container>
      <Header>
        <VscLink size={16} />
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Enter text or URL..."
        />
        <PrimaryButton onClick={generate}>Generate</PrimaryButton>
      </Header>

      <Content>
        <SizeButtons>
          {[200, 300, 400, 500].map(size => (
            <SizeButton key={size} $active={qrSize === size} onClick={() => setQrSize(size)}>
              {size}x{size}
            </SizeButton>
          ))}
        </SizeButtons>
        <QRCanvas ref={canvasRef} />
        <Info>
          QR Code for: {text || '(enter text above)'}
        </Info>
      </Content>

      <Footer>
        <Button onClick={download} disabled={!generated}>
          <VscDownload size={14} /> Download PNG
        </Button>
        <Button onClick={copyImage} disabled={!generated}>
          <VscCopy size={14} /> Copy Image
        </Button>
      </Footer>
    </Container>
  );
}