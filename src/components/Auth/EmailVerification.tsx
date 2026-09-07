import React, { useState } from 'react';
import styled from 'styled-components';
import { VscMail, VscCheck, VscRefresh, VscWarning } from 'react-icons/vsc';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled.div`
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border);
  text-align: center;
`;

const Icon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #007acc22;
  border-radius: 50%;
  color: #007acc;
`;

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 18px;
  color: var(--text-primary);
`;

const Description = styled.p`
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
`;

const EmailHighlight = styled.span`
  color: #007acc;
  font-weight: 600;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: #007acc;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: #005fa3; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SecondaryButton = styled(Button)`
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border);

  &:hover { background: var(--bg-hover); }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
`;

const WarningBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fcc41922;
  border: 1px solid #fcc419;
  border-radius: 6px;
  margin-top: 16px;
  font-size: 13px;
  color: #fcc419;
`;

const CodeBox = styled.div`
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 6px;
  margin-top: 12px;
  font-family: monospace;
  font-size: 14px;
`;

interface EmailVerificationProps {
  onVerified?: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({ onVerified }) => {
  const { user, isEmailVerified, resendCode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  const handleSendVerification = async () => {
    setLoading(true);
    try {
      const newCode = await resendCode(user?.email || '');
      if (newCode) {
        setCode(newCode);
        setSent(true);
      }
    } catch (error) {
      console.error('Failed to send verification email:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (isEmailVerified) {
    return (
      <Container>
        <Icon style={{ background: '#51cf6622', color: '#51cf66' }}>
          <VscCheck size={32} />
        </Icon>
        <Title>이메일 인증 완료</Title>
        <Description>
          이메일 인증이 완료되었습니다. 모든 기능을 사용하실 수 있습니다.
        </Description>
        {onVerified && (
          <Button onClick={onVerified}>계속하기</Button>
        )}
      </Container>
    );
  }

  return (
    <Container>
      <Icon>
        <VscMail size={32} />
      </Icon>
      <Title>이메일 인증이 필요합니다</Title>
      <Description>
        <EmailHighlight>{user?.email}</EmailHighlight>로 인증 코드를 발송했습니다.
        <br />
        이메일을 확인하고 인증 코드를 입력해주세요.
      </Description>

      <ButtonGroup>
        <Button onClick={handleSendVerification} disabled={loading || sent}>
          <VscRefresh size={16} />
          {sent ? '인증 메일 발송 완료' : '인증 메일 발송'}
        </Button>
        <SecondaryButton onClick={handleRefresh}>
          <VscRefresh size={16} />
          새로고침
        </SecondaryButton>
      </ButtonGroup>

      {code && (
        <CodeBox>
          개발 모드 인증 코드: <strong>{code}</strong>
        </CodeBox>
      )}

      <WarningBox>
        <VscWarning size={16} />
        이메일을 받지 못하셨나요? 스팸 폴더를 확인해주세요.
      </WarningBox>
    </Container>
  );
};