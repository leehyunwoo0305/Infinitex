import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { VscCopy, VscCheck, VscTools, VscColorMode } from 'react-icons/vsc';

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

const Content = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const PickerPane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  gap: 16px;
  border-right: 1px solid var(--border);
`;

const ColorInput = styled.input`
  width: 100px;
  height: 100px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
  background: none;

  &::-webkit-color-swatch-wrapper { padding: 0; }
  &::-webkit-color-swatch { border: 2px solid var(--border); border-radius: 8px; }
`;

const HexInput = styled.input`
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Consolas', monospace;
  font-size: 16px;
  text-align: center;
  width: 120px;
`;

const SliderGroup = styled.div`
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SliderLabel = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 20px;
`;

const Slider = styled.input`
  flex: 1;
  height: 8px;
  -webkit-appearance: none;
  background: var(--border);
  border-radius: 4px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--text-primary);
    cursor: pointer;
  }
`;

const SliderValue = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 36px;
  text-align: right;
`;

const PreviewPane = styled.div`
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--bg-secondary);
  overflow-y: auto;
`;

const ColorBox = styled.div<{ $color: string }>`
  width: 100%;
  height: 80px;
  background: ${p => p.$color};
  border-radius: 8px;
  border: 1px solid var(--border);
`;

const ColorFormat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-primary);
  border-radius: 4px;
  border: 1px solid var(--border);
`;

const FormatLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
`;

const FormatValue = styled.span`
  font-family: 'Consolas', monospace;
  font-size: 12px;
  color: var(--text-primary);
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;

  &:hover { color: var(--text-primary); }
`;

const PresetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  margin-top: 8px;
`;

const PresetColor = styled.button<{ $color: string }>`
  width: 100%;
  aspect-ratio: 1;
  background: ${p => p.$color};
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  padding: 0;

  &:hover { transform: scale(1.1); z-index: 1; }
`;

const HarmonySection = styled.div`
  margin-top: 12px;
`;

const HarmonyTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
`;

const HarmonyColors = styled.div`
  display: flex;
  gap: 4px;
`;

const HarmonyColor = styled.div<{ $color: string }>`
  flex: 1;
  height: 32px;
  background: ${p => p.$color};
  border-radius: 4px;
  border: 1px solid var(--border);
  cursor: pointer;

  &:hover { transform: scale(1.05); }
`;

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  return match ? { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) } : null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100;
  let r: number, g: number, b: number;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 };
  const c = 1 - r / 255, m = 1 - g / 255, y = 1 - b / 255;
  const k = Math.min(c, m, y);
  return {
    c: Math.round(((c - k) / (1 - k)) * 100),
    m: Math.round(((m - k) / (1 - k)) * 100),
    y: Math.round(((y - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

const presetColors = [
  '#FF6B6B', '#FF8E8E', '#FFB4B4', '#FEC8D8', '#D4A5FF', '#B197FC', '#91A7FF', '#748FFC',
  '#4C6EF5', '#339AF0', '#22B8CF', '#20C997', '#51CF66', '#94D82D', '#FCC419', '#FF922B',
  '#FF6B6B', '#E64980', '#BE4BDB', '#7950F2', '#5C7CFA', '#4DABF7', '#3BC9DB', '#38D9A9',
  '#69DB7C', '#A9E34B', '#FFD43B', '#FFA94D', '#FF8787', '#FAA2C1', '#CC5DE8', '#845EF7',
];

export function ColorPicker() {
  const [color, setColor] = useState('#007ACC');
  const [copied, setCopied] = useState<string | null>(null);
  const [hue, setHue] = useState(200);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(40);

  const rgb = hexToRgb(color) || { r: 0, g: 0, b: 0 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

  const handleHslChange = useCallback((h: number, s: number, l: number) => {
    const rgb = hslToRgb(h, s, l);
    const hex = `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`.toUpperCase();
    setColor(hex);
    setHue(h); setSaturation(s); setLightness(l);
  }, []);

  const getHarmony = (baseHue: number) => {
    return [0, 30, 60, 120, 180, 240, 270, 330].map(offset => {
      const h = (baseHue + offset) % 360;
      const rgb = hslToRgb(h, saturation, lightness);
      return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`.toUpperCase();
    });
  };

  const copyValue = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const formats = [
    { label: 'HEX', value: color },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: 'CMYK', value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
  ];

  return (
    <Container>
      <Header>
        <VscColorMode size={16} />
        <span style={{ fontSize: 13 }}>Color Picker</span>
      </Header>

      <Content>
        <PickerPane>
          <ColorInput
            type="color"
            value={color}
            onChange={e => {
              setColor(e.target.value.toUpperCase());
              const rgb = hexToRgb(e.target.value);
              if (rgb) {
                const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                setHue(hsl.h); setSaturation(hsl.s); setLightness(hsl.l);
              }
            }}
          />
          <HexInput
            value={color}
            onChange={e => {
              if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                setColor(e.target.value.toUpperCase());
              }
            }}
            maxLength={7}
          />

          <SliderGroup>
            <SliderRow>
              <SliderLabel>H</SliderLabel>
              <Slider
                type="range" min={0} max={360} value={hue}
                onChange={e => handleHslChange(parseInt(e.target.value), saturation, lightness)}
                style={{ background: `linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))` }}
              />
              <SliderValue>{hue}°</SliderValue>
            </SliderRow>
            <SliderRow>
              <SliderLabel>S</SliderLabel>
              <Slider
                type="range" min={0} max={100} value={saturation}
                onChange={e => handleHslChange(hue, parseInt(e.target.value), lightness)}
              />
              <SliderValue>{saturation}%</SliderValue>
            </SliderRow>
            <SliderRow>
              <SliderLabel>L</SliderLabel>
              <Slider
                type="range" min={0} max={100} value={lightness}
                onChange={e => handleHslChange(hue, saturation, parseInt(e.target.value))}
              />
              <SliderValue>{lightness}%</SliderValue>
            </SliderRow>
          </SliderGroup>

          <PresetGrid>
            {presetColors.map((c, i) => (
              <PresetColor key={i} $color={c} onClick={() => {
                setColor(c.toUpperCase());
                const rgb = hexToRgb(c);
                if (rgb) { const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b); setHue(hsl.h); setSaturation(hsl.s); setLightness(hsl.l); }
              }} />
            ))}
          </PresetGrid>
        </PickerPane>

        <PreviewPane>
          <ColorBox $color={color} />
          
          {formats.map(f => (
            <ColorFormat key={f.label}>
              <div>
                <FormatLabel>{f.label}</FormatLabel>
                <FormatValue>{f.value}</FormatValue>
              </div>
              <CopyButton onClick={() => copyValue(f.label, f.value)} title="Copy">
                {copied === f.label ? <VscCheck size={14} /> : <VscCopy size={14} />}
              </CopyButton>
            </ColorFormat>
          ))}

          <HarmonySection>
            <HarmonyTitle>Color Harmony</HarmonyTitle>
            <HarmonyColors>
              {getHarmony(hue).map((c, i) => (
                <HarmonyColor key={i} $color={c} onClick={() => {
                  setColor(c);
                  const rgb = hexToRgb(c);
                  if (rgb) { const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b); setHue(hsl.h); setSaturation(hsl.s); setLightness(hsl.l); }
                }} title={c} />
              ))}
            </HarmonyColors>
          </HarmonySection>
        </PreviewPane>
      </Content>
    </Container>
  );
}