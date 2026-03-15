/*
Copyright (C) 2025 QuantumNous — AGPL-3.0
*/

import React, { useEffect, useState } from 'react';
import { API, showError } from '../../helpers';
import { marked } from 'marked';
import { Empty } from '@douyinfe/semi-ui';
import {
  IllustrationConstruction,
  IllustrationConstructionDark,
} from '@/components/compat/illustrations';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();
  const [about, setAbout] = useState('');
  const [aboutLoaded, setAboutLoaded] = useState(false);
  const currentYear = new Date().getFullYear();

  const displayAbout = async () => {
    setAbout(localStorage.getItem('about') || '');
    const res = await API.get('/api/about');
    const { success, message, data } = res.data;
    if (success) {
      let aboutContent = data;
      if (!data.startsWith('https://')) {
        aboutContent = marked.parse(data);
      }
      setAbout(aboutContent);
      localStorage.setItem('about', aboutContent);
    } else {
      showError(message);
      setAbout(t('加载关于内容失败...'));
    }
    setAboutLoaded(true);
  };

  useEffect(() => {
    displayAbout().then();
  }, []);

  const customDescription = (
    <div style={{ textAlign: 'center' }}>
      <p className='text-muted-foreground'>{t('可在设置页面设置关于内容，支持 HTML & Markdown')}</p>
      <p className='mt-3 text-xs text-muted-foreground/60'>
        Aurora © {currentYear} · {t('基于')}{' '}
        <a href='https://github.com/QuantumNous/new-api' target='_blank' rel='noopener noreferrer' className='underline underline-offset-4 hover:text-foreground transition-colors'>
          New API
        </a>{' '}
        (AGPL-3.0)
      </p>
    </div>
  );

  return (
    <div className='mt-[60px] px-2'>
      {aboutLoaded && about === '' ? (
        <div className='flex justify-center items-center h-screen p-8'>
          <Empty
            image={<IllustrationConstruction style={{ width: 150, height: 150 }} />}
            darkModeImage={<IllustrationConstructionDark style={{ width: 150, height: 150 }} />}
            description={t('管理员暂时未设置任何关于内容')}
            style={{ padding: '24px' }}
          >
            {customDescription}
          </Empty>
        </div>
      ) : (
        <>
          {about.startsWith('https://') ? (
            <iframe src={about} style={{ width: '100%', height: '100vh', border: 'none' }} />
          ) : (
            <div style={{ fontSize: 'larger' }} dangerouslySetInnerHTML={{ __html: about }} />
          )}
        </>
      )}
    </div>
  );
};

export default About;
