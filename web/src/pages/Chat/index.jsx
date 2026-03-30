import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const ChatPage = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const iframeRef = useRef(null);

  useEffect(() => {
    // Just check if chat service is available, then load iframe
    // The auto-login endpoint (/chat/) handles auth automatically
    const checkService = async () => {
      try {
        const resp = await fetch('/chat/api/config');
        if (resp.ok) {
          setStatus('ready');
        } else {
          throw new Error('Chat service unavailable');
        }
      } catch (err) {
        setError(err.message || t('聊天服务不可用'));
        setStatus('error');
      }
    };
    checkService();
  }, [t]);

  if (status === 'loading') {
    return (
      <div style={fullScreenStyle}>
        <div style={{ textAlign: 'center' }}>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" style={{ margin: '0 auto 12px' }} />
          <span className="text-sm text-muted-foreground">{t('正在初始化聊天...')}</span>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={fullScreenStyle}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: '0 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>💬</div>
          <h2 className="text-lg font-semibold text-foreground" style={{ marginBottom: 8 }}>{t('聊天服务')}</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <iframe
        ref={iframeRef}
        src="/chat/"
        style={iframeStyle}
        title="Chat"
        allow="camera;microphone;clipboard-write"
      />
    </div>
  );
};

// Fixed positioning: exactly below header, fill remaining space
const containerStyle = {
  position: 'fixed',
  top: 64,
  left: 'var(--sidebar-current-width, 0px)',
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  zIndex: 50,
  background: 'hsl(var(--background))',
};

const fullScreenStyle = {
  position: 'fixed',
  top: 64,
  left: 'var(--sidebar-current-width, 0px)',
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
  background: 'hsl(var(--background))',
};

const iframeStyle = {
  width: '100%',
  flex: 1,
  border: 'none',
};

export default ChatPage;
