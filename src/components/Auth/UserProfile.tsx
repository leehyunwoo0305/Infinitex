import React, { useState } from 'react';
import styled from 'styled-components';
import { VscPerson, VscMail, VscCheck, VscWarning, VscSignOut, VscSettingsGear } from 'react-icons/vsc';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled.div`
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const Avatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #007acc22;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #007acc;
  font-size: 24px;
  font-weight: 600;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const UserEmail = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const VerifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: #51cf6622;
  color: #51cf66;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
`;

const UnverifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: #fcc41922;
  color: #fcc419;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
`;

const Section = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const StatBox = styled.div`
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 6px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: var(--bg-hover); }
`;

const DangerButton = styled(Button)`
  border-color: #f44;
  color: #f44;

  &:hover { background: #f442; }
`;

interface UserProfileProps {
  onLogout?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onLogout }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      onLogout?.();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const initials = user.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email?.[0]?.toUpperCase() || '?';

  return (
    <Container>
      <Header>
        <Avatar>{initials}</Avatar>
        <UserInfo>
          <UserName>{user.displayName || '사용자'}</UserName>
          <UserEmail>
            <VscMail size={12} />
            {user.email}
              <VerifiedBadge>
                <VscCheck size={10} /> 인증됨
              </VerifiedBadge>
          </UserEmail>
        </UserInfo>
      </Header>

      <Section>
        <SectionTitle>사용량</SectionTitle>
        <StatGrid>
          <StatBox>
            <StatValue>12</StatValue>
            <StatLabel>프로젝트</StatLabel>
          </StatBox>
          <StatBox>
            <StatValue>48</StatValue>
            <StatLabel>파일</StatLabel>
          </StatBox>
          <StatBox>
            <StatValue>3</StatValue>
            <StatLabel>协作</StatLabel>
          </StatBox>
        </StatGrid>
      </Section>

      <ButtonGroup>
        <Button>
          <VscSettingsGear size={14} />
          설정
        </Button>
        <DangerButton onClick={handleLogout} disabled={loading}>
          <VscSignOut size={14} />
          {loading ? '로그아웃 중...' : '로그아웃'}
        </DangerButton>
      </ButtonGroup>
    </Container>
  );
};