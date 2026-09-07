import { useState } from 'react';
import styled from 'styled-components';
import { VscTools, VscTrash, VscChevronDown } from 'react-icons/vsc';

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

const Tab = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-bottom: 2px solid ${p => p.$active ? '#007acc' : 'transparent'};
  background: ${p => p.$active ? 'var(--bg-tertiary)' : 'transparent'};
  color: ${p => p.$active ? 'var(--text-primary)' : 'var(--text-secondary)'};
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;

  &:hover { background: var(--bg-tertiary); }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CalcDisplay = styled.div`
  padding: 16px 24px;
  text-align: right;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
`;

const CalcExpression = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  min-height: 20px;
`;

const CalcResult = styled.div`
  font-size: 48px;
  font-weight: 300;
  font-family: 'Consolas', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CalcGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  padding: 1px;
  flex: 1;
  background: var(--border);
`;

const CalcButton = styled.button<{ $variant?: 'operator' | 'action' | 'equals' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${p => p.$variant === 'operator' || p.$variant === 'action' ? '18px' : '20px'};
  font-weight: ${p => p.$variant === 'equals' ? '600' : '400'};
  border: none;
  cursor: pointer;
  transition: background 0.1s;
  background: ${p => p.$variant === 'operator' ? 'var(--bg-tertiary)' : p.$variant === 'action' ? 'var(--bg-secondary)' : p.$variant === 'equals' ? '#007acc' : 'var(--bg-primary)'};
  color: ${p => p.$variant === 'equals' ? 'white' : 'var(--text-primary)'};

  &:hover { background: var(--bg-hover); }
  &:active { background: var(--bg-active); }
`;

const ConverterContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
  overflow-y: auto;
`;

const ConverterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ConverterInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Consolas', monospace;
  font-size: 16px;
`;

const ConverterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
`;

const ResultBox = styled.div`
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  text-align: center;
`;

const ResultValue = styled.div`
  font-size: 28px;
  font-family: 'Consolas', monospace;
  color: #007acc;
`;

const ResultLabel = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
`;

const CategoryTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  margin-top: 8px;
  margin-bottom: 4px;
`;

const unitConversions: Record<string, Record<string, number>> = {
  length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 },
  weight: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495, t: 1000 },
  temperature: { C: 1, F: 1, K: 1 },
  volume: { L: 1, mL: 0.001, gal: 3.78541, qt: 0.946353, pt: 0.473176, cup: 0.236588 },
  data: { B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776 },
};

function convertTemperature(value: number, from: string, to: string): number {
  let celsius: number;
  switch (from) {
    case 'C': celsius = value; break;
    case 'F': celsius = (value - 32) * 5/9; break;
    case 'K': celsius = value - 273.15; break;
    default: celsius = value;
  }
  switch (to) {
    case 'C': return celsius;
    case 'F': return celsius * 9/5 + 32;
    case 'K': return celsius + 273.15;
    default: return celsius;
  }
}

function convert(value: number, from: string, to: string, category: string): number {
  if (category === 'temperature') return convertTemperature(value, from, to);
  const units = unitConversions[category];
  if (!units) return value;
  const baseValue = value * units[from];
  return baseValue / units[to];
}

function calculateBmi(weight: number, height: number): { bmi: number; category: string } {
  const bmi = weight / (height / 100) ** 2;
  let category = '';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';
  return { bmi, category };
}

export function Calculator() {
  const [mode, setMode] = useState<'calc' | 'bmi' | 'converter'>('calc');
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [history, setHistory] = useState<string[]>([]);

  // BMI state
  const [bmiWeight, setBmiWeight] = useState(70);
  const [bmiHeight, setBmiHeight] = useState(170);
  const bmi = calculateBmi(bmiWeight, bmiHeight);

  // Converter state
  const [convCategory, setConvCategory] = useState('length');
  const [convFrom, setConvFrom] = useState('m');
  const [convTo, setConvTo] = useState('km');
  const [convValue, setConvValue] = useState(1);
  const convResult = convert(convValue, convFrom, convTo, convCategory);

  const handleButton = (value: string) => {
    switch (value) {
      case 'C':
        setExpression('');
        setResult('0');
        break;
      case '⌫':
        setExpression(prev => prev.slice(0, -1));
        break;
      case '=':
        try {
          const evalResult = Function('"use strict";return (' + expression.replace(/[^-()\d/*+%.]/g, '') + ')')();
          const resultStr = String(evalResult);
          setResult(resultStr);
          setHistory(prev => [`${expression} = ${resultStr}`, ...prev].slice(0, 20));
          setExpression(resultStr);
        } catch {
          setResult('Error');
        }
        break;
      case '+/-':
        if (expression.startsWith('-')) setExpression(expression.slice(1));
        else setExpression('-' + expression);
        break;
      default:
        setExpression(prev => prev + value);
    }
  };

  return (
    <Container>
      <Header>
        <VscTools size={16} />
        <Tab $active={mode === 'calc'} onClick={() => setMode('calc')}>Calculator</Tab>
        <Tab $active={mode === 'bmi'} onClick={() => setMode('bmi')}>BMI</Tab>
        <Tab $active={mode === 'converter'} onClick={() => setMode('converter')}>Converter</Tab>
      </Header>

      <Content>
        {mode === 'calc' && (
          <>
            <CalcDisplay>
              <CalcExpression>{expression || ' '}</CalcExpression>
              <CalcResult>{result}</CalcResult>
            </CalcDisplay>
            <CalcGrid>
              {['C', '()', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '+/-', '0', '.', '='].map(btn => (
                <CalcButton
                  key={btn}
                  $variant={btn === '=' ? 'equals' : '÷×-+'.includes(btn) ? 'operator' : 'C()%/'.includes(btn) ? 'action' : undefined}
                  onClick={() => {
                    const mapped = btn === '÷' ? '/' : btn === '×' ? '*' : btn;
                    handleButton(mapped);
                  }}
                >
                  {btn}
                </CalcButton>
              ))}
            </CalcGrid>
            {history.length > 0 && (
              <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 12, color: 'var(--text-secondary)', maxHeight: 100, overflow: 'auto' }}>
                {history.slice(0, 5).map((h, i) => <div key={i}>{h}</div>)}
              </div>
            )}
          </>
        )}

        {mode === 'bmi' && (
          <ConverterContent>
            <CategoryTitle>Body Mass Index Calculator</CategoryTitle>
            <ConverterRow>
              <span style={{ minWidth: 60, fontSize: 13 }}>Weight (kg)</span>
              <ConverterInput
                type="number"
                value={bmiWeight}
                onChange={e => setBmiWeight(parseFloat(e.target.value) || 0)}
              />
            </ConverterRow>
            <ConverterRow>
              <span style={{ minWidth: 60, fontSize: 13 }}>Height (cm)</span>
              <ConverterInput
                type="number"
                value={bmiHeight}
                onChange={e => setBmiHeight(parseFloat(e.target.value) || 0)}
              />
            </ConverterRow>
            <ResultBox>
              <ResultValue>{bmi.bmi.toFixed(1)}</ResultValue>
              <ResultLabel>{bmi.category}</ResultLabel>
            </ResultBox>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 16 }}>
              <div style={{ marginBottom: 8 }}>BMI Categories:</div>
              <div>• Underweight: &lt; 18.5</div>
              <div>• Normal: 18.5 - 24.9</div>
              <div>• Overweight: 25 - 29.9</div>
              <div>• Obese: ≥ 30</div>
            </div>
          </ConverterContent>
        )}

        {mode === 'converter' && (
          <ConverterContent>
            <CategoryTitle>Unit Converter</CategoryTitle>
            <ConverterSelect value={convCategory} onChange={e => {
              setConvCategory(e.target.value);
              const units = Object.keys(unitConversions[e.target.value]);
              setConvFrom(units[0]);
              setConvTo(units[1] || units[0]);
            }}>
              {Object.keys(unitConversions).map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </ConverterSelect>
            <ConverterRow>
              <ConverterInput
                type="number"
                value={convValue}
                onChange={e => setConvValue(parseFloat(e.target.value) || 0)}
              />
              <ConverterSelect value={convFrom} onChange={e => setConvFrom(e.target.value)}>
                {Object.keys(unitConversions[convCategory]).map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </ConverterSelect>
            </ConverterRow>
            <ResultBox>
              <ResultValue>{convResult.toFixed(4)}</ResultValue>
              <ResultLabel>{convTo}</ResultLabel>
            </ResultBox>
          </ConverterContent>
        )}
      </Content>
    </Container>
  );
}