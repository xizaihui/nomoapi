import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { API } from '../../helpers/api';

const CHAT_BASE = '/chat';

const ChatPage = () => {
  const { t } = useTranslation();
  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatReady, setChatReady] = useState(false);
  const [error, setError] = useState('');
  const iframeRef = useRef(null);
  const tokenSwitchRef = useRef(false);

  // Fetch user's tokens
  useEffect(() => {
    const loadTokens = async () => {
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
        setSelectedToken(found || activeTokens[0]);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };
    loadTokens();
  }, []);

  // Connect to LibreChat when token is selected
  const connectChat = useCallback(async (token) => {
    if (!token) return;
    setChatReady(false);
    setError('');

    try {
      // Get the real key
      const keyResp = await API.post(`/api/token/${token.id}/key`);
      const { success: keySuccess, data: keyData } = keyResp.data;
      if (!keySuccess || !keyData?.key) throw new Error('Failed to get token key');

      const fullKey = `sk-${keyData.key}`;

      // Auth with LibreChat via our bridge
      const authResp = await API.post('/api/librechat/auth', { token_key: fullKey });
      if (!authResp.data?.success) {
        throw new Error(authResp.data?.error || 'Chat auth failed');
      }

      setChatReady(true);
      localStorage.setItem('chat_selected_token', String(token.id));
    } catch (err) {
      console.error('Chat connect error:', err);
      setError(err.message || t('聊天服务连接失败'));
    }
  }, [t]);

  useEffect(() => {
    if (selectedToken) {
      connectChat(selectedToken);
    }
  }, [selectedToken, connectChat]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">{t('加载中...')}</span>
        </div>
      </div>
    );
  }

  if (error && tokens.length === 0) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-background">
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
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Token selector bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <span className="text-xs text-muted-foreground whitespace-nowrap">{t('令牌')}:</span>
        <select
          className="h-8 rounded-md border border-input bg-background px-3 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          value={selectedToken?.id || ''}
          onChange={(e) => {
            const token = tokens.find((t) => t.id === parseInt(e.target.value));
            setSelectedToken(token);
          }}
        >
          {tokens.map((token) => (
            <option key={token.id} value={token.id}>
              {token.name} ({token.remain_quota > 0 ? `$${(token.remain_quota / 500000).toFixed(2)}` : t('无限额度')})
            </option>
          ))}
        </select>
        {chatReady && (
          <span className="inline-flex items-center gap-1 text-xs text-green-600">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            {t('已连接')}
          </span>
        )}
        {error && !chatReady && (
          <span className="text-xs text-destructive">{error}</span>
        )}
        <a
          href={`${window.location.protocol}//${window.location.hostname}:3080`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('新窗口打开')} ↗
        </a>
      </div>

      {/* Chat iframe - same origin via /chat/ reverse proxy */}
      {chatReady ? (
        <iframe
          ref={iframeRef}
          src={`${CHAT_BASE}/c/new`}
          style={{ width: '100%', flex: 1, border: 'none' }}
          title="Chat"
          allow="camera;microphone;clipboard-write"
        />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">{t('正在连接聊天服务...')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
