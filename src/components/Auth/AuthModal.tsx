import React, { useState } from 'react';
import styled from 'styled-components';
import { VscClose, VscMail, VscLock, VscPerson, VscEye, VscEyeClosed } from 'react-icons/vsc';
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
  width: 400px;
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

const Form = styled.form`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-primary);
  transition: border-color 0.15s;

  &:focus-within {
    border-color: #007acc;
  }
`;

const InputIcon = styled.div`
  padding: 0 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 0;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;

  &::placeholder { color: var(--text-secondary); opacity: 0.5; }
`;

const TogglePassword = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0 12px;
  display: flex;
  align-items: center;

  &:hover { color: var(--text-primary); }
`;

const SubmitButton = styled.button`
  padding: 12px;
  border: none;
  border-radius: 6px;
  background: #007acc;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: #005fa3; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ErrorText = styled.div`
  padding: 8px 12px;
  background: #f442;
  border-radius: 6px;
  color: #f44;
  font-size: 13px;
`;

const SuccessText = styled.div`
  padding: 8px 12px;
  background: #007acc22;
  border-radius: 6px;
  color: #007acc;
  font-size: 13px;
`;

const SwitchText = styled.div`
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
  padding-top: 8px;
`;

const SwitchLink = styled.button`
  background: none;
  border: none;
  color: #007acc;
  cursor: pointer;
  font-size: 13px;

  &:hover { text-decoration: underline; }
`;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { register, login } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('비밀번호가 일치하지 않습니다.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('비밀번호는 6자 이상이어야 합니다.');
          setLoading(false);
          return;
        }
        await register(email, password, displayName);
        setSuccess('회원가입 성공! 이메일 인증 링크를 확인해주세요.');
      } else {
        await login(email, password);
        onClose();
      }
    } catch (err: any) {
      let errorMessage = '오류가 발생했습니다.';
      if (err.code === 'auth/user-not-found') {
        errorMessage = '등록되지 않은 이메일입니다.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = '비밀번호가 틀렸습니다.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = '이미 사용 중인 이메일입니다.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = '올바른 이메일 형식이 아닙니다.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = '비밀번호가 너무 약합니다.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>{mode === 'login' ? '로그인' : '회원가입'}</Title>
          <CloseButton onClick={onClose}>
            <VscClose size={18} />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <InputGroup>
              <Label>이름</Label>
              <InputWrapper>
                <InputIcon><VscPerson size={16} /></InputIcon>
                <Input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  required
                />
              </InputWrapper>
            </InputGroup>
          )}

          <InputGroup>
            <Label>이메일</Label>
            <InputWrapper>
              <InputIcon><VscMail size={16} /></InputIcon>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                required
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>비밀번호</Label>
            <InputWrapper>
              <InputIcon><VscLock size={16} /></InputIcon>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                minLength={6}
              />
              <TogglePassword type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <VscEyeClosed size={16} /> : <VscEye size={16} />}
              </TogglePassword>
            </InputWrapper>
          </InputGroup>

          {mode === 'signup' && (
            <InputGroup>
              <Label>비밀번호 확인</Label>
              <InputWrapper>
                <InputIcon><VscLock size={16} /></InputIcon>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                  minLength={6}
                />
              </InputWrapper>
            </InputGroup>
          )}

          {error && <ErrorText>{error}</ErrorText>}
          {success && <SuccessText>{success}</SuccessText>}

          <SubmitButton type="submit" disabled={loading}>
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </SubmitButton>

          <SwitchText>
            {mode === 'login' ? (
              <>
                계정이 없으신가요?{' '}
                <SwitchLink onClick={() => { setMode('signup'); resetForm(); }}>
                  회원가입
                </SwitchLink>
              </>
            ) : (
              <>
                이미 계정이 있으신가요?{' '}
                <SwitchLink onClick={() => { setMode('login'); resetForm(); }}>
                  로그인
                </SwitchLink>
              </>
            )}
          </SwitchText>
        </Form>
      </Modal>
    </Overlay>
  );
};