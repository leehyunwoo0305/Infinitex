import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { VscClose, VscAdd } from 'react-icons/vsc';
import { useStore } from '../../store/useStore';
import { isElectronApp, electronAPI } from '../../utils/electron';
import '@xterm/xterm/css/xterm.css';

interface TerminalInstance {
  id: number;
  name: string;
  xterm: XTerminal;
  fitAddon: FitAddon;
  currentLine: string;
}

export const Terminal: React.FC = () => {
  const { terminalOpen, toggleTerminal, workspacePath } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const instancesRef = useRef<Map<number, TerminalInstance>>(new Map());
  const [terminals, setTerminals] = useState<{ id: number; name: string }[]>([{ id: 1, name: 'Terminal 1' }]);
  const [activeTerminalId, setActiveTerminalId] = useState(1);
  const nextIdRef = useRef(2);

  const createTerminal = useCallback((id: number, container: HTMLDivElement): TerminalInstance => {
    const xterm = new XTerminal({
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        cursorAccent: '#1e1e1e',
        selectionBackground: '#264f78',
      },
      fontFamily: "'Consolas', 'Monaco', monospace",
      fontSize: 13,
      lineHeight: 1.2,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    xterm.loadAddon(fitAddon);
    xterm.loadAddon(webLinksAddon);

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.display = id === activeTerminalId ? 'block' : 'none';
    wrapper.dataset.terminalId = String(id);
    container.appendChild(wrapper);

    xterm.open(wrapper);
    fitAddon.fit();

    xterm.write('\x1b[1;36mInfinitex Terminal\x1b[0m\r\n');
    xterm.write('\x1b[33mType "help" for available commands\x1b[0m\r\n');
    xterm.write('\r\n');

    const instance: TerminalInstance = { id, name: `Terminal ${id}`, xterm, fitAddon, currentLine: '' };

    const prompt = () => {
      const dir = workspacePath ? workspacePath.split(/[/\\]/).pop() || '~' : '~';
      xterm.write(`\x1b[32m${dir} ❯\x1b[0m `);
    };

    prompt();

    xterm.onKey(({ key, domEvent }) => {
      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

      if (domEvent.keyCode === 13) {
        xterm.write('\r\n');
        if (instance.currentLine.trim()) {
          processCommand(xterm, instance.currentLine.trim());
        }
        instance.currentLine = '';
        prompt();
      } else if (domEvent.keyCode === 8) {
        if (instance.currentLine.length > 0) {
          xterm.write('\b \b');
          instance.currentLine = instance.currentLine.slice(0, -1);
        }
      } else if (printable) {
        instance.currentLine += key;
        xterm.write(key);
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(wrapper);

    (xterm as any)._resizeObserver = resizeObserver;

    return instance;
  }, [workspacePath, activeTerminalId]);

  const processCommand = async (terminal: XTerminal, command: string) => {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();

    if (cmd === 'clear') {
      terminal.clear();
      return;
    }

    if (cmd === 'help') {
      terminal.write('\x1b[1;33mAvailable commands:\x1b[0m\r\n');
      terminal.write('  help     - Show this help message\r\n');
      terminal.write('  clear    - Clear terminal\r\n');
      terminal.write('  exit     - Close terminal\r\n');
      terminal.write('\r\nAll other commands are executed via system shell.\r\n\r\n');
      return;
    }

    if (cmd === 'exit') {
      toggleTerminal();
      return;
    }

    if (isElectronApp && electronAPI) {
      try {
        const result = await electronAPI.terminalExec(command, workspacePath || undefined);
        if (result.stdout) terminal.write(result.stdout.replace(/\n/g, '\r\n'));
        if (result.stderr) terminal.write(`\x1b[31m${result.stderr.replace(/\n/g, '\r\n')}\x1b[0m`);
        if (!result.stdout && !result.stderr && result.error) {
          terminal.write(`\x1b[31m${result.error}\x1b[0m\r\n`);
        }
      } catch (error: any) {
        terminal.write(`\x1b[31m${error.message}\x1b[0m\r\n`);
      }
      return;
    }

    terminal.write(`\x1b[31mCommand execution requires Electron.\x1b[0m\r\n`);
  };

  useEffect(() => {
    if (!containerRef.current || !terminalOpen) return;

    if (!instancesRef.current.has(1)) {
      const instance = createTerminal(1, containerRef.current);
      instancesRef.current.set(1, instance);
    }

    return () => {
      instancesRef.current.forEach((inst) => {
        (inst.xterm as any)._resizeObserver?.disconnect();
        inst.xterm.dispose();
      });
      instancesRef.current.clear();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [terminalOpen, createTerminal]);

  useEffect(() => {
    instancesRef.current.forEach((inst, id) => {
      const wrapper = containerRef.current?.querySelector(`[data-terminal-id="${id}"]`) as HTMLElement;
      if (wrapper) {
        wrapper.style.display = id === activeTerminalId ? 'block' : 'none';
      }
      if (id === activeTerminalId) {
        inst.fitAddon.fit();
        inst.xterm.focus();
      }
    });
  }, [activeTerminalId]);

  const addTerminal = () => {
    const newId = nextIdRef.current++;
    const name = `Terminal ${newId}`;
    setTerminals((prev) => [...prev, { id: newId, name }]);
    setActiveTerminalId(newId);

    if (containerRef.current) {
      const instance = createTerminal(newId, containerRef.current);
      instancesRef.current.set(newId, instance);
    }
  };

  const closeTerminal = (id: number) => {
    if (terminals.length === 1) return;

    const inst = instancesRef.current.get(id);
    if (inst) {
      const wrapper = containerRef.current?.querySelector(`[data-terminal-id="${id}"]`);
      if (wrapper) {
        (inst.xterm as any)._resizeObserver?.disconnect();
        inst.xterm.dispose();
        wrapper.remove();
      }
      instancesRef.current.delete(id);
    }

    setTerminals((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (activeTerminalId === id) {
        setActiveTerminalId(next[0].id);
      }
      return next;
    });
  };

  if (!terminalOpen) return null;

  return (
    <div className="terminal-panel">
      <div className="terminal-header">
        <div style={{ display: 'flex', gap: '4px' }}>
          {terminals.map((terminal) => (
            <div
              key={terminal.id}
              className={`tab ${terminal.id === activeTerminalId ? 'active' : ''}`}
              onClick={() => setActiveTerminalId(terminal.id)}
              style={{ padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}
            >
              {terminal.name}
              {terminals.length > 1 && (
                <span
                  className="tab-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTerminal(terminal.id);
                  }}
                  style={{ marginLeft: '8px' }}
                >
                  <VscClose size={12} />
                </span>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="toolbar-button" onClick={addTerminal} title="New Terminal">
            <VscAdd size={14} />
          </button>
          <button
            className="toolbar-button"
            onClick={toggleTerminal}
            title="Close Terminal"
          >
            <VscClose size={14} />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="terminal-content"
        style={{ position: 'relative', flex: 1 }}
      />
    </div>
  );
};
