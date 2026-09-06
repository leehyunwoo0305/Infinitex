import React from 'react';
import { VscClose } from 'react-icons/vsc';
import { useStore } from '../../store/useStore';
import { themes } from '../../store/themes';

interface ThemeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({ isOpen, onClose }) => {
  const { activeTheme, setTheme } = useStore();
  
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: '#252526',
        borderRadius: '8px',
        padding: '24px',
        minWidth: '400px',
        maxHeight: '80vh',
        overflow: 'auto',
        border: '1px solid #3c3c3c',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#d4d4d4' }}>
            Theme Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#858585',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <VscClose size={20} />
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {themes.map(theme => (
            <button
              key={theme.id}
              onClick={() => {
                setTheme(theme);
                onClose();
              }}
              style={{
                padding: '16px',
                border: activeTheme.id === theme.id 
                  ? `2px solid ${theme.colors.accent}` 
                  : '2px solid #3c3c3c',
                borderRadius: '8px',
                backgroundColor: theme.colors.background,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: theme.colors.foreground,
                marginBottom: '8px',
              }}>
                {theme.name}
              </div>
              
              <div style={{
                display: 'flex',
                gap: '4px',
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: theme.colors.background,
                  border: '1px solid #555',
                }} />
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: theme.colors.sidebar,
                  border: '1px solid #555',
                }} />
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: theme.colors.accent,
                  border: '1px solid #555',
                }} />
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: theme.colors.foreground,
                  border: '1px solid #555',
                }} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};