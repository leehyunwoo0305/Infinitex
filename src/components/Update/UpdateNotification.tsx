import React, { useState, useEffect } from 'react';
import { VscClose, VscCloudDownload, VscRefresh, VscCheck } from 'react-icons/vsc';
import { updater, isElectronApp } from '../../utils/electron';

interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string;
}

interface DownloadProgress {
  percent: number;
  transferred: number;
  total: number;
}

export const UpdateNotification: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!isElectronApp) return;

    updater.onChecking(() => {
      setChecking(true);
    });

    updater.onAvailable((info) => {
      setUpdateInfo(info);
      setShowNotification(true);
      setChecking(false);
    });

    updater.onNotAvailable(() => {
      setChecking(false);
    });

    updater.onProgress((progress) => {
      setDownloadProgress(progress);
    });

    updater.onDownloaded((info) => {
      setDownloaded(true);
      setDownloading(false);
      setUpdateInfo((prev) => prev ? { ...prev, ...info } : prev);
    });

    updater.onError((err) => {
      setError(err);
      setDownloading(false);
      setChecking(false);
    });

    return () => {
      // Cleanup listeners
    };
  }, []);

  const handleCheckForUpdates = async () => {
    setChecking(true);
    setError(null);
    await updater.checkForUpdates();
  };

  const handleInstallUpdate = () => {
    updater.installUpdate();
  };

  const handleClose = () => {
    setShowNotification(false);
    setUpdateInfo(null);
    setDownloadProgress(null);
    setDownloaded(false);
    setError(null);
  };

  if (!isElectronApp) return null;

  return (
    <>
      {/* Update indicator in status bar */}
      <div 
        onClick={handleCheckForUpdates}
        style={{ 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '0 8px',
        }}
        title={checking ? 'Checking for updates...' : 'Check for updates'}
      >
        {checking ? (
          <VscRefresh size={12} className="spinning" />
        ) : (
          <VscCloudDownload size={12} />
        )}
      </div>

      {/* Update notification popup */}
      {showNotification && (
        <div style={{
          position: 'fixed',
          top: '40px',
          right: '16px',
          width: '360px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {downloaded ? (
                <VscCheck color="#4ec9b0" size={16} />
              ) : (
                <VscCloudDownload color="var(--accent-color)" size={16} />
              )}
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {downloaded ? 'Update Ready' : 'Update Available'}
              </span>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <VscClose size={16} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '16px' }}>
            {error ? (
              <div style={{ color: 'var(--error-color, #f44747)', fontSize: '13px' }}>
                {error}
              </div>
            ) : downloaded && updateInfo ? (
              <div>
                <div style={{ marginBottom: '12px', color: 'var(--text-primary)', fontSize: '13px' }}>
                  <div>Version {updateInfo.version} is ready to install.</div>
                  {updateInfo.releaseNotes && (
                    <div style={{ 
                      marginTop: '8px', 
                      padding: '8px', 
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      maxHeight: '100px',
                      overflow: 'auto',
                    }}>
                      {updateInfo.releaseNotes}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleInstallUpdate}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'var(--accent-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <VscRefresh size={14} />
                  Restart & Install
                </button>
              </div>
            ) : downloading && downloadProgress ? (
              <div>
                <div style={{ marginBottom: '12px', color: 'var(--text-primary)', fontSize: '13px' }}>
                  Downloading update...
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${downloadProgress.percent}%`,
                    height: '100%',
                    backgroundColor: 'var(--accent-color)',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '12px', 
                  color: 'var(--text-secondary)',
                  textAlign: 'right',
                }}>
                  {Math.round(downloadProgress.percent)}%
                </div>
              </div>
            ) : updateInfo ? (
              <div>
                <div style={{ marginBottom: '12px', color: 'var(--text-primary)', fontSize: '13px' }}>
                  <div>A new version of Infinitex is available.</div>
                  <div style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    Version {updateInfo.version}
                  </div>
                  {updateInfo.releaseNotes && (
                    <div style={{ 
                      marginTop: '8px', 
                      padding: '8px', 
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      maxHeight: '100px',
                      overflow: 'auto',
                    }}>
                      {updateInfo.releaseNotes}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setDownloading(true);
                    updater.downloadUpdate();
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'var(--accent-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <VscCloudDownload size={14} />
                  Download Update
                </button>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div style={{
            padding: '8px 16px',
            borderTop: '1px solid var(--border-color)',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}>
            {checking ? 'Checking for updates...' : 'Click to check for updates'}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
};
