import React, { useState } from 'react';
import styled from 'styled-components';
import { VscClose, VscGithubInverted } from 'react-icons/vsc';
import { useAuth } from '../../contexts/AuthContext';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const Modal = styled.div`
  width: 380px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  color: var(--text-primary);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;

  &:hover { color: var(--text-primary); }
`;

const Content = styled.div`
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const LogoIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #007acc 0%, #005fa3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
`;

const Title2 = styled.h1`
  margin: 0;
  font-size: 20px;
  color: var(--text-primary);
  font-weight: 600;
`;

const Description = styled.p`
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.5;
`;

const GithubButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 24px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #24292e;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 8px;

  &:hover { background: #2f363d; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ErrorText = styled.div`
  padding: 10px 14px;
  background: #f442;
  border-radius: 6px;
  color: #f44;
  font-size: 13px;
  width: 100%;
`;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginGithub } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGithubLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginGithub();
      onClose();
    } catch (err: any) {
      setError(err.message || 'GitHub 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>로그인</Title>
          <CloseButton onClick={onClose}>
            <VscClose size={18} />
          </CloseButton>
        </Header>

        <Content>
          <LogoIcon>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M13.5 2C6.596 2 1 7.596 1 14.5c0 5.525 3.586 10.22 8.541 11.889.625.116.854-.272.854-.604 0-.296-.011-1.282-.017-2.32-3.477.754-4.209-1.67-4.209-1.67-.569-1.443-1.388-1.827-1.388-1.827-1.135-.776.086-.76.086-.76 1.255.088 1.915 1.287 1.915 1.287 1.115 1.908 2.926 1.355 3.64 1.035.113-.805.437-1.356.794-1.666-2.776-.315-5.694-1.388-5.694-6.18 0-1.366.488-2.483 1.288-3.358-.129-.316-.558-1.584.122-3.304 0 0 1.049-.336 3.436 1.281A11.98 11.98 0 0113.5 6.844c1.061.005 2.133.143 3.127.42 2.384-1.617 3.431-1.281 3.431-1.281.682 1.72.252 2.988.123 3.304.801.875 1.287 1.992 1.287 3.358 0 4.805-2.924 5.862-5.707 6.173.449.388.852 1.15.852 2.32 0 1.674-.015 3.024-.015 3.433 0 .335.226.725.858.603C19.42 24.716 23 20.02 23 14.5 23 7.596 17.404 2 10.5 2h3z"/>
            </svg>
          </LogoIcon>
          <Title2>Infinitex에 로그인</Title2>
          <Description>
            개발자를 위한 코드 에디터.<br />
            GitHub 계정으로 빠르게 시작하세요.
          </Description>

          {error && <ErrorText>{error}</ErrorText>}

          <GithubButton type="button" onClick={handleGithubLogin} disabled={loading}>
            <VscGithubInverted size={20} />
            {loading ? '로그인 중...' : 'GitHub으로 로그인'}
          </GithubButton>
        </Content>
      </Modal>
    </Overlay>
  );
};
