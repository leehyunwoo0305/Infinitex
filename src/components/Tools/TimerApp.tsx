import { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { VscTools, VscDebugStart, VscDebugPause, VscDebugStop, VscBell, VscCoffee, VscTarget } from 'react-icons/vsc';

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
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 24px;
`;

const TimerDisplay = styled.div`
  font-size: 72px;
  font-weight: 300;
  font-family: 'Consolas', monospace;
  letter-spacing: 4px;
  color: var(--text-primary);
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const ActiveTimer = styled(TimerDisplay)`
  color: #007acc;
  animation: ${p => p.className?.includes('running') ? pulse : 'none'} 1s ease-in-out infinite;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
`;

const ControlButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid ${p => p.$variant === 'danger' ? '#f44' : p.$variant === 'primary' ? '#007acc' : 'var(--border)'};
  background: ${p => p.$variant === 'danger' ? '#f442' : p.$variant === 'primary' ? '#007acc22' : 'var(--bg-primary)'};
  color: ${p => p.$variant === 'danger' ? '#f44' : p.$variant === 'primary' ? '#007acc' : 'var(--text-primary)'};
  cursor: pointer;
  font-size: 20px;
  transition: all 0.15s;

  &:hover { 
    background: ${p => p.$variant === 'danger' ? '#f443' : p.$variant === 'primary' ? '#007acc33' : 'var(--bg-hover)'};
    transform: scale(1.05);
  }
`;

const SessionInfo = styled.div`
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-secondary);
`;

const SessionBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 12px;
  background: var(--bg-tertiary);
`;

const PomodoroConfig = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin-top: 16px;
`;

const ConfigItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const ConfigLabel = styled.span`
  font-size: 11px;
  color: var(--text-secondary);
`;

const ConfigInput = styled.input`
  width: 60px;
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  text-align: center;
`;

const ProgressRing = styled.svg`
  transform: rotate(-90deg);
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
  font-size: 12px;
  color: var(--text-secondary);
`;

type TimerMode = 'stopwatch' | 'countdown' | 'pomodoro';

export function TimerApp() {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [pomodoroConfig, setPomodoroConfig] = useState({ work: 25, break: 5, longBreak: 15 });
  const [pomodoroPhase, setPomodoroPhase] = useState<'work' | 'break' | 'longBreak'>('work');
  const [sessions, setSessions] = useState(0);
  const [countdownInput, setCountdownInput] = useState(300);
  const intervalRef = useRef<number | null>(null);

  const playAlarm = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(prev => {
          if (mode === 'countdown') {
            if (prev <= 0) {
              setRunning(false);
              playAlarm();
              return 0;
            }
            return prev - 1;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode, playAlarm]);

  useEffect(() => {
    if (mode === 'pomodoro' && running && pomodoroPhase === 'work') {
      if (seconds >= pomodoroConfig.work * 60) {
        setSessions(s => s + 1);
        setPomodoroPhase(sessions % 4 === 3 ? 'longBreak' : 'break');
        setSeconds(0);
        playAlarm();
      }
    } else if (mode === 'pomodoro' && running && (pomodoroPhase === 'break' || pomodoroPhase === 'longBreak')) {
      const breakTime = pomodoroPhase === 'longBreak' ? pomodoroConfig.longBreak : pomodoroConfig.break;
      if (seconds >= breakTime * 60) {
        setPomodoroPhase('work');
        setSeconds(0);
        playAlarm();
      }
    }
  }, [seconds, running, mode, pomodoroPhase, pomodoroConfig, sessions, playAlarm]);

  const start = () => {
    if (mode === 'countdown' && seconds === 0) setSeconds(countdownInput);
    setRunning(true);
  };

  const pause = () => setRunning(false);

  const reset = () => {
    setRunning(false);
    setSeconds(0);
    setPomodoroPhase('work');
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getMaxTime = () => {
    if (mode === 'countdown') return countdownInput;
    if (mode === 'pomodoro') {
      if (pomodoroPhase === 'work') return pomodoroConfig.work * 60;
      if (pomodoroPhase === 'break') return pomodoroConfig.break * 60;
      return pomodoroConfig.longBreak * 60;
    }
    return 3600;
  };

  const progress = (seconds / getMaxTime()) * 100;

  return (
    <Container>
      <Header>
        <VscTools size={16} />
        <Tab $active={mode === 'stopwatch'} onClick={() => { setMode('stopwatch'); reset(); }}>
          Stopwatch
        </Tab>
        <Tab $active={mode === 'countdown'} onClick={() => { setMode('countdown'); reset(); }}>
          Countdown
        </Tab>
        <Tab $active={mode === 'pomodoro'} onClick={() => { setMode('pomodoro'); reset(); }}>
          <VscTarget size={14} /> Pomodoro
        </Tab>
      </Header>

      <Content>
        <ProgressRing width={240} height={240}>
          <circle cx="120" cy="120" r="110" fill="none" stroke="var(--border)" strokeWidth="4" />
          <circle
            cx="120" cy="120" r="110" fill="none"
            stroke="#007acc" strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 110}`}
            strokeDashoffset={`${2 * Math.PI * 110 * (1 - progress / 100)}`}
            strokeLinecap="round"
          />
        </ProgressRing>

        <ActiveTimer className={running ? 'running' : ''} style={{ marginTop: -200, marginBottom: 100 }}>
          {formatTime(seconds)}
        </ActiveTimer>

        <SessionInfo>
          {mode === 'pomodoro' && (
            <>
              <SessionBadge>
                <VscTarget size={12} /> Phase: {pomodoroPhase}
              </SessionBadge>
              <SessionBadge>
                Sessions: {sessions}
              </SessionBadge>
            </>
          )}
        </SessionInfo>

        <Controls>
          {!running ? (
            <ControlButton $variant="primary" onClick={start}>
              <VscDebugStart />
            </ControlButton>
          ) : (
            <ControlButton onClick={pause}>
              <VscDebugPause />
            </ControlButton>
          )}
          <ControlButton $variant="danger" onClick={reset}>
            <VscDebugStop />
          </ControlButton>
        </Controls>

        {mode === 'countdown' && !running && seconds === 0 && (
          <PomodoroConfig>
            <ConfigItem>
              <ConfigLabel>Minutes</ConfigLabel>
              <ConfigInput
                type="number"
                value={Math.floor(countdownInput / 60)}
                onChange={e => setCountdownInput((parseInt(e.target.value) || 0) * 60 + countdownInput % 60)}
                min={0}
              />
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Seconds</ConfigLabel>
              <ConfigInput
                type="number"
                value={countdownInput % 60}
                onChange={e => setCountdownInput(Math.floor(countdownInput / 60) * 60 + (parseInt(e.target.value) || 0))}
                min={0}
                max={59}
              />
            </ConfigItem>
          </PomodoroConfig>
        )}

        {mode === 'pomodoro' && !running && pomodoroPhase === 'work' && seconds === 0 && (
          <PomodoroConfig>
            <ConfigItem>
              <ConfigLabel>Work (min)</ConfigLabel>
              <ConfigInput
                type="number"
                value={pomodoroConfig.work}
                onChange={e => setPomodoroConfig(c => ({ ...c, work: parseInt(e.target.value) || 25 }))}
                min={1}
              />
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Break (min)</ConfigLabel>
              <ConfigInput
                type="number"
                value={pomodoroConfig.break}
                onChange={e => setPomodoroConfig(c => ({ ...c, break: parseInt(e.target.value) || 5 }))}
                min={1}
              />
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Long Break</ConfigLabel>
              <ConfigInput
                type="number"
                value={pomodoroConfig.longBreak}
                onChange={e => setPomodoroConfig(c => ({ ...c, longBreak: parseInt(e.target.value) || 15 }))}
                min={1}
              />
            </ConfigItem>
          </PomodoroConfig>
        )}
      </Content>

      <Footer>
        {mode === 'pomodoro' && <span>Work: {pomodoroConfig.work}m | Break: {pomodoroConfig.break}m | Long: {pomodoroConfig.longBreak}m</span>}
        {mode === 'countdown' && <span>Countdown: {formatTime(countdownInput)}</span>}
      </Footer>
    </Container>
  );
}