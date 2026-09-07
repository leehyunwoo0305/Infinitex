import React, { useState } from 'react';
import {
  VscCode,
  VscSearch,
  VscTerminal,
  VscJson,
  VscMarkdown,
  VscSend,
  VscPackage,
  VscDatabase,
  VscServer,
  VscClose,
  VscFile,
  VscTools,
  VscLock,
  VscListFlat,
  VscDeviceMobile,
  VscDebug,
  VscWatch,
  VscColorMode,
  VscGlobe
} from 'react-icons/vsc';
import { JsonYamlEditor } from '../Editors/JsonYamlEditor';
import { MarkdownPreview } from '../Preview/MarkdownPreview';
import { RegexTester } from './RegexTester';
import { SnippetManager } from './SnippetManager';
import { LogViewer } from './LogViewer';
import { ApiTester } from './ApiTester';
import { PackageManagerUI } from './PackageManagerUI';
import { DatabaseViewer } from './DatabaseViewer';
import { DockerManager } from './DockerManager';
import { FileConverter } from './FileConverter';
import { Minifier } from './Minifier';
import { EncoderDecoder } from './EncoderDecoder';
import { TestDataGenerator } from './TestDataGenerator';
import { QRCodeGenerator } from './QRCodeGenerator';
import { TimerApp } from './TimerApp';
import { AsciiArtGenerator } from './AsciiArtGenerator';
import { ColorPicker } from './ColorPicker';
import { Calculator } from './Calculator';
import { NetworkTools } from './NetworkTools';
import { useStore } from '../../store/useStore';

type ToolTab = 'json' | 'markdown' | 'regex' | 'snippets' | 'logs' | 'api' | 'packages' | 'database' | 'docker' | 'converter' | 'minifier' | 'encoder' | 'testdata' | 'qrcode' | 'timer' | 'ascii' | 'colorpicker' | 'calculator' | 'network';

interface Tool {
  id: ToolTab;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

export const ToolsPanel: React.FC = () => {
  const { toolsOpen, toggleTools } = useStore();
  const [activeTool, setActiveTool] = useState<ToolTab>('json');

  const tools: Tool[] = [
    { id: 'json', name: 'JSON/YAML', icon: <VscJson size={16} />, component: <JsonYamlEditor /> },
    { id: 'markdown', name: 'Markdown', icon: <VscMarkdown size={16} />, component: <MarkdownPreview /> },
    { id: 'regex', name: 'Regex', icon: <VscSearch size={16} />, component: <RegexTester /> },
    { id: 'snippets', name: 'Snippets', icon: <VscCode size={16} />, component: <SnippetManager /> },
    { id: 'logs', name: 'Logs', icon: <VscTerminal size={16} />, component: <LogViewer /> },
    { id: 'api', name: 'API Client', icon: <VscSend size={16} />, component: <ApiTester /> },
    { id: 'packages', name: 'Packages', icon: <VscPackage size={16} />, component: <PackageManagerUI /> },
    { id: 'database', name: 'Database', icon: <VscDatabase size={16} />, component: <DatabaseViewer /> },
    { id: 'docker', name: 'Docker', icon: <VscServer size={16} />, component: <DockerManager /> },
    { id: 'converter', name: 'Converter', icon: <VscFile size={16} />, component: <FileConverter /> },
    { id: 'minifier', name: 'Minifier', icon: <VscTools size={16} />, component: <Minifier /> },
    { id: 'encoder', name: 'Encoder', icon: <VscLock size={16} />, component: <EncoderDecoder /> },
    { id: 'testdata', name: 'Test Data', icon: <VscListFlat size={16} />, component: <TestDataGenerator /> },
    { id: 'qrcode', name: 'QR Code', icon: <VscDeviceMobile size={16} />, component: <QRCodeGenerator /> },
    { id: 'timer', name: 'Timer', icon: <VscWatch size={16} />, component: <TimerApp /> },
    { id: 'ascii', name: 'ASCII Art', icon: <VscFile size={16} />, component: <AsciiArtGenerator /> },
    { id: 'colorpicker', name: 'Color Picker', icon: <VscColorMode size={16} />, component: <ColorPicker /> },
    { id: 'calculator', name: 'Calculator', icon: <VscTools size={16} />, component: <Calculator /> },
    { id: 'network', name: 'Network', icon: <VscGlobe size={16} />, component: <NetworkTools /> },
  ];

  if (!toolsOpen) return null;

  const activeToolData = tools.find(t => t.id === activeTool);

  return (
    <div style={{
      position: 'fixed',
      top: '60px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90vw',
      height: '80vh',
      maxWidth: '1400px',
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 1000,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-tertiary)',
      }}>
        <span style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: 'var(--text-primary)',
        }}>
          Developer Tools
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={toggleTools}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        >
          <VscClose size={16} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar - Tool List */}
        <div style={{
          width: '180px',
          borderRight: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          overflow: 'auto',
        }}>
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: 'none',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: activeTool === tool.id ? 'var(--bg-tertiary)' : 'transparent',
                color: activeTool === tool.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '13px',
              }}
            >
              {tool.icon}
              {tool.name}
            </button>
          ))}
        </div>

        {/* Tool Content */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
        }}>
          {activeToolData?.component}
        </div>
      </div>
    </div>
  );
};