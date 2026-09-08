import React from 'react';
import styled from 'styled-components';
import { VscCheck } from 'react-icons/vsc';

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
  border-radius: 50%;
  background: #007acc22;
  color: #007acc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
`;

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 16px;
  color: var(--text-primary);
`;

const Description = styled.p`
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
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

interface EmailVerificationProps {
  onVerified?: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({ onVerified }) => {
  return (
    <Container>
      <Icon style={{ background: '#51cf6622', color: '#51cf66' }}>
        <VscCheck size={32} />
      </Icon>
      <Title>로그인 완료</Title>
      <Description>
        GitHub 계정으로 로그인되었습니다. 모든 기능을 사용하실 수 있습니다.
      </Description>
      {onVerified && (
        <Button onClick={onVerified}>계속하기</Button>
      )}
    </Container>
  );
};
