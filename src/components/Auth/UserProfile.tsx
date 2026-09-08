import React, { useState } from 'react';
import styled from 'styled-components';
import { VscSignOut } from 'react-icons/vsc';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled.div`
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007acc 0%, #005fa3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 600;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #f44222;
    color: white;
    border-color: #f44222;
  }
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

  const initials = (user.displayName || user.email || '?')[0].toUpperCase();

  return (
    <Container>
      <Header>
        <Avatar>
          {user.avatar ? (
            <img src={user.avatar} alt={user.displayName || ''} />
          ) : (
            initials
          )}
        </Avatar>
        <UserInfo>
          <UserName>{user.displayName || 'User'}</UserName>
          <UserEmail>{user.email}</UserEmail>
        </UserInfo>
      </Header>
      <LogoutButton onClick={handleLogout} disabled={loading}>
        <VscSignOut size={14} />
        {loading ? 'Logging out...' : 'Logout'}
      </LogoutButton>
    </Container>
  );
};
