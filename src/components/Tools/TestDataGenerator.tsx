import { useState } from 'react';
import styled from 'styled-components';
import { VscCopy, VscCheck, VscTools, VscRefresh, VscPerson, VscMail, VscCallOutgoing, VscCalendar, VscListOrdered, VscSymbolNumeric, VscAccount } from 'react-icons/vsc';

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
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Options = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  padding: 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
`;

const Input = styled.input`
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  width: 100%;
`;

const Output = styled.textarea`
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

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen', 'Emma', 'Noah', 'Olivia', 'Liam', 'Ava', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'naver.com', 'daum.net', 'kakao.com', 'example.com', 'test.com'];
const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Maple Dr', 'Cedar Ln', 'Elm St', 'Park Ave', 'Lake Dr', 'Hill Rd', 'River Ln'];
const cities = ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'London', 'Tokyo'];
const countries = ['Korea', 'USA', 'Japan', 'China', 'UK', 'Germany', 'France', 'Canada', 'Australia'];
const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua'];
const companyNames = ['Acme Corp', 'TechStart', 'InnovateLab', 'DataFlow', 'CloudNine', 'NextGen', 'Quantum', 'CyberTech', 'DigitalEdge', 'FutureTech'];
const jobTitles = ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'DevOps Engineer', 'CTO', 'CEO', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer'];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

type DataType = 'name' | 'email' | 'address' | 'phone' | 'date' | 'lorem' | 'number' | 'uuid' | 'username' | 'company' | 'json' | 'color';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function generatePhone(): string {
  const formats = ['010-XXXX-XXXX', '02-XXX-XXXX', '031-XXX-XXXX', '+1-XXX-XXX-XXXX', '+82-10-XXXX-XXXX'];
  const fmt = pick(formats);
  return fmt.replace(/X/g, () => String(randInt(0, 9)));
}

function generateDate(): string {
  const year = randInt(2000, 2025);
  const month = String(randInt(1, 12)).padStart(2, '0');
  const day = String(randInt(1, 28)).padStart(2, '0');
  const hour = String(randInt(0, 23)).padStart(2, '0');
  const min = String(randInt(0, 59)).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${min}`;
}

function generateColor(): string {
  const r = randInt(0, 255);
  const g = randInt(0, 255);
  const b = randInt(0, 255);
  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  return `${hex} | rgb(${r}, ${g}, ${b})`;
}

function generateLorem(paragraphs: number): string {
  return Array.from({ length: paragraphs }, () => {
    const len = randInt(3, 8);
    const sentence = Array.from({ length: len }, () => {
      const wordLen = randInt(3, 10);
      return Array.from({ length: wordLen }, () => pick(words)).join('');
    }).join(' ');
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  }).join('\n\n');
}

function generateJson(): string {
  return JSON.stringify({
    id: randInt(1, 10000),
    name: `${pick(firstNames)} ${pick(lastNames)}`,
    email: `${pick(firstNames).toLowerCase()}@${pick(domains)}`,
    phone: generatePhone(),
    address: {
      street: `${randInt(1, 999)} ${pick(streets)}`,
      city: pick(cities),
      country: pick(countries)
    },
    company: pick(companyNames),
    jobTitle: pick(jobTitles),
    createdAt: generateDate()
  }, null, 2);
}

export function TestDataGenerator() {
  const [type, setType] = useState<DataType>('name');
  const [count, setCount] = useState(10);
  const [paragraphs, setParagraphs] = useState(3);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const items: string[] = [];
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'name': items.push(`${pick(firstNames)} ${pick(lastNames)}`); break;
        case 'email': items.push(`${pick(firstNames).toLowerCase()}.${pick(lastNames).toLowerCase()}@${pick(domains)}`); break;
        case 'address': items.push(`${randInt(1, 999)} ${pick(streets)}, ${pick(cities)}, ${pick(countries)}`); break;
        case 'phone': items.push(generatePhone()); break;
        case 'date': items.push(generateDate()); break;
        case 'uuid': items.push(generateUUID()); break;
        case 'username': items.push(`${pick(firstNames).toLowerCase()}${randInt(1, 999)}`); break;
        case 'company': items.push(`${pick(companyNames)} - ${pick(jobTitles)}`); break;
        case 'color': items.push(generateColor()); break;
        case 'lorem': items.push(generateLorem(paragraphs)); break;
        case 'number': items.push(String(randInt(0, 100000))); break;
        case 'json': items.push(generateJson()); break;
      }
    }
    setOutput(type === 'json' || type === 'lorem' ? items.join('\n') : items.join('\n'));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Container>
      <Header>
        <VscTools size={16} />
        <Select value={type} onChange={e => setType(e.target.value as DataType)}>
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="address">Address</option>
          <option value="phone">Phone</option>
          <option value="date">Date</option>
          <option value="uuid">UUID</option>
          <option value="username">Username</option>
          <option value="company">Company</option>
          <option value="color">Color</option>
          <option value="lorem">Lorem Ipsum</option>
          <option value="number">Number</option>
          <option value="json">JSON Object</option>
        </Select>
        <Input
          type="number"
          value={count}
          onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
          style={{ width: 60 }}
          min={1}
          max={1000}
        />
        {type === 'lorem' && (
          <Input
            type="number"
            value={paragraphs}
            onChange={e => setParagraphs(Math.max(1, parseInt(e.target.value) || 1))}
            style={{ width: 80 }}
            min={1}
            max={50}
            placeholder="Paragraphs"
          />
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
        <Output
          value={output}
          readOnly
          placeholder="Click 'Generate' to create test data..."
          spellCheck={false}
        />
      </Content>

      <Footer>
        <span>{output.split('\n').filter(l => l).length} items generated</span>
        <span>{output.length.toLocaleString()} characters</span>
      </Footer>
    </Container>
  );
}