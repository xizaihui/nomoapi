/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Input,
  ScrollList,
  ScrollItem,
} from '@douyinfe/semi-ui';
import { API, showError, copy, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { API_ENDPOINTS } from '../../constants/common.constant';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import {
  IconGithubLogo,
  IconPlay,
  IconFile,
  IconCopy,
} from '@/components/compat/icons';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';
import {
  Moonshot,
  OpenAI,
  XAI,
  Claude,
  Gemini,
  DeepSeek,
  Qwen,
  Midjourney,
  Grok,
  AzureAI,
} from '@lobehub/icons';

const { Text } = Typography;

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const serverAddress =
    statusState?.status?.server_address || `${window.location.origin}`;
  const endpointItems = API_ENDPOINTS.map((e) => ({ value: e }));
  const [endpointIndex, setEndpointIndex] = useState(0);
  const isChinese = i18n.language.startsWith('zh');

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

      // 如果内容是 URL，则发送主题模式
      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  const handleCopyBaseURL = async () => {
    const ok = await copy(serverAddress);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setEndpointIndex((prev) => (prev + 1) % endpointItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [endpointItems.length]);

  return (
    <div className='w-full overflow-x-hidden'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div className='w-full overflow-x-hidden'>
          {/* Hero */}
          <div className='w-full min-h-[85vh] flex items-center justify-center px-4 py-20 mt-10'>
            <div className='flex flex-col items-center text-center max-w-2xl mx-auto'>
              {/* Title */}
              <h1 className='text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-tight tracking-tight'>
                {t('统一的')}{' '}
                <span className='text-muted-foreground'>{t('大模型接口网关')}</span>
              </h1>

              <p className='text-sm md:text-base text-muted-foreground mt-4 max-w-md'>
                {t('更好的价格，更好的稳定性，只需要将模型基址替换为：')}
              </p>

              {/* Base URL */}
              <div className='w-full max-w-md mt-6'>
                <Input
                  readonly
                  value={serverAddress}
                  className='!rounded-lg'
                  size={isMobile ? 'default' : 'large'}
                  suffix={
                    <div className='flex items-center gap-2'>
                      <ScrollList bodyHeight={32} style={{ border: 'unset', boxShadow: 'unset' }}>
                        <ScrollItem
                          mode='wheel'
                          cycled
                          list={endpointItems}
                          selectedIndex={endpointIndex}
                          onSelect={({ index }) => setEndpointIndex(index)}
                        />
                      </ScrollList>
                      <Button type='primary' onClick={handleCopyBaseURL} icon={<IconCopy />} className='!rounded-lg' />
                    </div>
                  }
                />
              </div>

              {/* Actions */}
              <div className='flex gap-3 mt-6'>
                <Link to='/console'>
                  <Button theme='solid' type='primary' size={isMobile ? 'default' : 'large'} className='!rounded-lg !px-6' icon={<IconPlay />}>
                    {t('获取密钥')}
                  </Button>
                </Link>
                {isDemoSiteMode && statusState?.status?.version ? (
                  <Button
                    size={isMobile ? 'default' : 'large'}
                    className='!rounded-lg !px-4'
                    icon={<IconGithubLogo />}
                    onClick={() => window.open('https://github.com/QuantumNous/new-api', '_blank')}
                  >
                    {statusState.status.version}
                  </Button>
                ) : (
                  docsLink && (
                    <Button size={isMobile ? 'default' : 'large'} className='!rounded-lg !px-4' icon={<IconFile />} onClick={() => window.open(docsLink, '_blank')}>
                      {t('文档')}
                    </Button>
                  )
                )}
              </div>

              {/* Provider icons */}
              <div className='mt-16 w-full'>
                <p className='text-xs uppercase tracking-widest text-foreground/40 mb-6'>
                  {t('支持众多的大模型供应商')}
                </p>
                <div className='flex flex-wrap items-center justify-center gap-4 md:gap-6 max-w-lg mx-auto opacity-40'>
                  {[Moonshot, OpenAI, XAI, Claude, Gemini, DeepSeek, Qwen, Grok, AzureAI, Midjourney].map((Icon, i) => (
                    <div key={i} className='w-8 h-8 md:w-10 md:h-10 flex items-center justify-center'>
                      <Icon size={32} />
                    </div>
                  ))}
                  <span className='text-sm font-medium text-muted-foreground'>30+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='overflow-x-hidden w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className='w-full h-screen border-none'
            />
          ) : (
            <div
              className='mt-[60px]'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
