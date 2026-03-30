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
  const keySetRef = useRef(false);

  // Fetch tokens and auto-connect
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Get user's tokens
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

        // 2. Auto-select token
        const lastId = localStorage.getItem('chat_selected_token');
        const found = activeTokens.find((t) => String(t.id) === lastId);
        const token = found || activeTokens[0];
        setSelectedToken(token);

        // 3. Get real key and set it in LibreChat
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

      // Set key in LibreChat via bridge
      const authResp = await API.post('/api/librechat/auth', { token_key: fullKey });
      if (!authResp.data?.success) {
        throw new Error(authResp.data?.error || 'Chat auth failed');
      }

      localStorage.setItem('chat_selected_token', String(token.id));
      setChatReady(true);
      // Use timestamp to force iframe reload on token switch
      setIframeSrc(`/chat/?t=${Date.now()}`);
      keySetRef.current = true;
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
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">{t('正在初始化聊天...')}</span>
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
      {/* Minimal token selector */}
      <div className="flex items-center gap-3 px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <span className="text-xs text-muted-foreground whitespace-nowrap">{t('令牌')}:</span>
        <select
          className="h-8 rounded-md border border-input bg-background px-3 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
          <span className="inline-flex items-center gap-1 text-xs text-green-600">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            {t('已连接')}
          </span>
        )}
        {error && !chatReady && (
          <span className="text-xs text-destructive">{error}</span>
        )}
      </div>

      {/* Chat iframe */}
      {chatReady && iframeSrc ? (
        <iframe
          ref={iframeRef}
          key={iframeSrc}
          src={iframeSrc}
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
