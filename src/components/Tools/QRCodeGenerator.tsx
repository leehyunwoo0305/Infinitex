import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { VscCopy, VscDownload, VscLink } from 'react-icons/vsc';
import QRCode from 'qrcode';

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

export function QRCodeGenerator() {
  const [text, setText] = useState('https://github.com/leehyunwoo0305/Infinitex');
  const [qrSize, setQrSize] = useState(300);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (text) generate();
  }, [text, qrSize]);

  const generate = async () => {
    if (!canvasRef.current || !text) return;
    try {
      await QRCode.toCanvas(canvasRef.current, text, {
        width: qrSize,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });
      setGenerated(true);
    } catch (err) {
      console.error('QR generation failed:', err);
    }
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
    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvasRef.current!.toBlob(resolve, 'image/png');
      });
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
      }
    } catch (err) {
      console.error('Copy failed:', err);
    }
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
