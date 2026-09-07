import { useState } from 'react';
import styled from 'styled-components';
import { VscTools, VscGlobe, VscRefresh, VscCopy, VscCheck, VscServer, VscLink } from 'react-icons/vsc';

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
  overflow-y: auto;
  padding: 16px;
  gap: 12px;
`;

const InputRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Consolas', monospace;
  font-size: 13px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
`;

const InfoCard = styled.div`
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border);
`;

const InfoLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const InfoValue = styled.div`
  font-family: 'Consolas', monospace;
  font-size: 14px;
  color: var(--text-primary);
  word-break: break-all;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  display: inline-flex;
  align-items: center;
  margin-left: 8px;

  &:hover { color: var(--text-primary); }
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Consolas', monospace;
`;

const Tag = styled.span`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
`;

const SuccessTag = styled(Tag)` background: #007acc22; color: #007acc; `;
const ErrorTag = styled(Tag)` background: #f442; color: #f44; `;

const commonPorts: Record<number, string> = {
  21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS', 80: 'HTTP',
  110: 'POP3', 143: 'IMAP', 443: 'HTTPS', 445: 'SMB', 993: 'IMAPS', 995: 'POP3S',
  1433: 'MSSQL', 1521: 'Oracle', 3000: 'Dev', 3306: 'MySQL', 3389: 'RDP',
  5432: 'PostgreSQL', 5900: 'VNC', 6379: 'Redis', 8080: 'HTTP-Alt', 8443: 'HTTPS-Alt',
  27017: 'MongoDB',
};

export function NetworkTools() {
  const [activeTab, setActiveTab] = useState<'ip' | 'dns' | 'port'>('ip');
  const [ipInfo, setIpInfo] = useState<any>(null);
  const [dnsQuery, setDnsQuery] = useState('');
  const [dnsResult, setDnsResult] = useState<any>(null);
  const [portHost, setPortHost] = useState('localhost');
  const [portResults, setPortResults] = useState<{ port: number; open: boolean; service: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchIpInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      setIpInfo(data);
    } catch (e) {
      setIpInfo({ error: 'Failed to fetch IP info' });
    }
    setLoading(false);
  };

  const lookupDns = async () => {
    if (!dnsQuery) return;
    setLoading(true);
    try {
      // Try DNS-over-HTTPS with Cloudflare
      const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${dnsQuery}&type=A`, {
        headers: { 'Accept': 'application/dns-json' }
      });
      const data = await res.json();
      setDnsResult(data);
    } catch {
      setDnsResult({ error: 'DNS lookup failed' });
    }
    setLoading(false);
  };

  const scanPorts = async () => {
    setLoading(true);
    // Client-side port check (limited by browser security)
    const portsToCheck = [21, 22, 80, 443, 3000, 3306, 5432, 8080, 8443];
    const results: { port: number; open: boolean; service: string }[] = [];

    for (const port of portsToCheck) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1000);
        await fetch(`http://${portHost}:${port}`, { mode: 'no-cors', signal: controller.signal });
        clearTimeout(timeout);
        results.push({ port, open: true, service: commonPorts[port] || 'Unknown' });
      } catch {
        results.push({ port, open: false, service: commonPorts[port] || 'Unknown' });
      }
    }

    setPortResults(results);
    setLoading(false);
  };

  const copyValue = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Container>
      <Header>
        <VscGlobe size={16} />
        <Tab $active={activeTab === 'ip'} onClick={() => setActiveTab('ip')}>IP Info</Tab>
        <Tab $active={activeTab === 'dns'} onClick={() => setActiveTab('dns')}>DNS Lookup</Tab>
        <Tab $active={activeTab === 'port'} onClick={() => setActiveTab('port')}>Port Scanner</Tab>
      </Header>

      <Content>
        {activeTab === 'ip' && (
          <>
            <PrimaryButton onClick={fetchIpInfo} disabled={loading}>
              <VscRefresh size={14} /> {loading ? 'Loading...' : 'Get My IP Info'}
            </PrimaryButton>
            {ipInfo && !ipInfo.error && (
              <InfoGrid>
                <InfoCard>
                  <InfoLabel>IP Address</InfoLabel>
                  <InfoValue>
                    {ipInfo.ip}
                    <CopyButton onClick={() => copyValue('IP', ipInfo.ip)}>
                      {copied === 'IP' ? <VscCheck size={12} /> : <VscCopy size={12} />}
                    </CopyButton>
                  </InfoValue>
                </InfoCard>
                <InfoCard>
                  <InfoLabel>Location</InfoLabel>
                  <InfoValue>{ipInfo.city}, {ipInfo.region}, {ipInfo.country_name}</InfoValue>
                </InfoCard>
                <InfoCard>
                  <InfoLabel>Coordinates</InfoLabel>
                  <InfoValue>{ipInfo.latitude}, {ipInfo.longitude}</InfoValue>
                </InfoCard>
                <InfoCard>
                  <InfoLabel>ISP</InfoLabel>
                  <InfoValue>{ipInfo.org}</InfoValue>
                </InfoCard>
                <InfoCard>
                  <InfoLabel>Timezone</InfoLabel>
                  <InfoValue>{ipInfo.timezone}</InfoValue>
                </InfoCard>
                <InfoCard>
                  <InfoLabel>Postal Code</InfoLabel>
                  <InfoValue>{ipInfo.postal}</InfoValue>
                </InfoCard>
              </InfoGrid>
            )}
            {ipInfo?.error && (
              <InfoCard>
                <InfoLabel>Error</InfoLabel>
                <InfoValue style={{ color: '#f44' }}>{ipInfo.error}</InfoValue>
              </InfoCard>
            )}
          </>
        )}

        {activeTab === 'dns' && (
          <>
            <InputRow>
              <Input
                value={dnsQuery}
                onChange={e => setDnsQuery(e.target.value)}
                placeholder="Enter domain (e.g., google.com)"
                onKeyDown={e => e.key === 'Enter' && lookupDns()}
              />
              <PrimaryButton onClick={lookupDns} disabled={loading || !dnsQuery}>
                <VscRefresh size={14} /> Lookup
              </PrimaryButton>
            </InputRow>
            {dnsResult && !dnsResult.error && (
              <InfoGrid>
                {dnsResult.Answer?.map((a: any, i: number) => (
                  <InfoCard key={i}>
                    <InfoLabel>Type {a.type} Record</InfoLabel>
                    <InfoValue>
                      {a.data}
                      <CopyButton onClick={() => copyValue(`DNS${i}`, a.data)}>
                        {copied === `DNS${i}` ? <VscCheck size={12} /> : <VscCopy size={12} />}
                      </CopyButton>
                    </InfoValue>
                  </InfoCard>
                ))}
                {(!dnsResult.Answer || dnsResult.Answer.length === 0) && (
                  <InfoCard>
                    <InfoLabel>Result</InfoLabel>
                    <InfoValue>No records found</InfoValue>
                  </InfoCard>
                )}
              </InfoGrid>
            )}
            {dnsResult?.error && (
              <InfoCard>
                <InfoLabel>Error</InfoLabel>
                <InfoValue style={{ color: '#f44' }}>{dnsResult.error}</InfoValue>
              </InfoCard>
            )}
          </>
        )}

        {activeTab === 'port' && (
          <>
            <InputRow>
              <Input
                value={portHost}
                onChange={e => setPortHost(e.target.value)}
                placeholder="Host to scan"
              />
              <PrimaryButton onClick={scanPorts} disabled={loading}>
                <VscRefresh size={14} /> {loading ? 'Scanning...' : 'Scan Ports'}
              </PrimaryButton>
            </InputRow>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Scanning common ports on {portHost}...
            </div>
            {portResults.length > 0 && (
              <HistoryList>
                {portResults.map(r => (
                  <HistoryItem key={r.port}>
                    <span>Port {r.port} ({r.service})</span>
                    {r.open ? <SuccessTag>OPEN</SuccessTag> : <ErrorTag>CLOSED</ErrorTag>}
                  </HistoryItem>
                ))}
              </HistoryList>
            )}
          </>
        )}
      </Content>
    </Container>
  );
}