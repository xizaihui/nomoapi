import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { API } from '../../helpers/api';

const ChatPage = () => {
  const { t } = useTranslation();
  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatReady, setChatReady] = useState(false);
  const [iframeSrc, setIframeSrc] = useState('');
  const [error, setError] = useState('');
  const iframeRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const response = await API.get('/api/token/?p=1&size=50');
        const { success, data } = response.data;
        if (!success) throw new Error('Failed to fetch tokens');

        const tokenItems = Array.isArray(data) ? data : data.items || [];
        const activeTokens = tokenItems.filter((t) => t.status === 1);

        if (activeTokens.length === 0) {
          setError(t('当前没有可用的启用令牌'));
          setIsLoading(false);
          return;
        }

        setTokens(activeTokens);
        const lastId = localStorage.getItem('chat_selected_token');
        const found = activeTokens.find((t) => String(t.id) === lastId);
        const token = found || activeTokens[0];
        setSelectedToken(token);
        await setKeyForToken(token);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const setKeyForToken = async (token) => {
    try {
      const keyResp = await API.post(`/api/token/${token.id}/key`);
      const { success: keySuccess, data: keyData } = keyResp.data;
      if (!keySuccess || !keyData?.key) throw new Error('Failed to get token key');

      const fullKey = `sk-${keyData.key}`;
      const authResp = await API.post('/api/librechat/auth', { token_key: fullKey });
      if (!authResp.data?.success) {
        throw new Error(authResp.data?.error || 'Chat auth failed');
      }

      localStorage.setItem('chat_selected_token', String(token.id));
      setChatReady(true);
      setIframeSrc(`/chat/?t=${Date.now()}`);
    } catch (err) {
      console.error('Set key error:', err);
      setError(err.message || t('聊天服务连接失败'));
    }
  };

  const handleTokenChange = async (e) => {
    const token = tokens.find((t) => t.id === parseInt(e.target.value));
    if (!token) return;
    setSelectedToken(token);
    setChatReady(false);
    setError('');
    await setKeyForToken(token);
  };

  if (isLoading) {
    return (
      <div style={fullScreenStyle}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">{t('正在初始化聊天...')}</span>
        </div>
      </div>
    );
  }

  if (error && tokens.length === 0) {
    return (
      <div style={fullScreenStyle}>
        <div className="flex flex-col items-center gap-4 max-w-md px-6 text-center">
          <div className="text-4xl">💬</div>
          <h2 className="text-lg font-semibold text-foreground">{t('聊天服务')}</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <a href="/console/token" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            {t('创建令牌')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Minimal token selector — thin bar */}
      <div style={tokenBarStyle}>
        <span style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>{t('令牌')}:</span>
        <select
          style={selectStyle}
          value={selectedToken?.id || ''}
          onChange={handleTokenChange}
        >
          {tokens.map((token) => (
            <option key={token.id} value={token.id}>
              {token.name} ({token.remain_quota > 0 ? `$${(token.remain_quota / 500000).toFixed(2)}` : t('无限额度')})
            </option>
          ))}
        </select>
        {chatReady && (
          <span style={{ fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            {t('已连接')}
          </span>
        )}
        {error && !chatReady && (
          <span style={{ fontSize: 11, color: '#ef4444' }}>{error}</span>
        )}
      </div>

      {/* Chat iframe — fills remaining space */}
      {chatReady && iframeSrc ? (
        <iframe
          ref={iframeRef}
          key={iframeSrc}
          src={iframeSrc}
          style={iframeStyle}
          title="Chat"
          allow="camera;microphone;clipboard-write"
        />
      ) : (
        <div style={{ ...fullScreenStyle, position: 'relative' }}>
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">{t('正在连接聊天服务...')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Fixed positioning to avoid header overlap
const containerStyle = {
  position: 'fixed',
  top: 64, // below NewAPI header (h-16 = 64px)
  left: 'var(--sidebar-current-width, 0px)',
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  zIndex: 50,
  background: 'hsl(var(--background))',
};

const fullScreenStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
};

const tokenBarStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '4px 12px',
  borderBottom: '1px solid hsl(var(--border))',
  background: 'hsl(var(--background))',
  flexShrink: 0,
  height: 36,
};

const selectStyle = {
  height: 28,
  borderRadius: 6,
  border: '1px solid hsl(var(--border))',
  background: 'hsl(var(--background))',
  padding: '0 8px',
  fontSize: 12,
  outline: 'none',
  color: 'inherit',
};

const iframeStyle = {
  width: '100%',
  flex: 1,
  border: 'none',
};

export default ChatPage;
