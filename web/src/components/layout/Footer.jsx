/*
Copyright (C) 2025 QuantumNous — AGPL-3.0
*/

import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { getFooterHTML, getSystemName } from '../../helpers';
import { StatusContext } from '../../context/Status';

const FooterBar = () => {
  const { t } = useTranslation();
  const [footer, setFooter] = useState(getFooterHTML());
  const systemName = getSystemName();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    let footer_html = localStorage.getItem('footer_html');
    if (footer_html) setFooter(footer_html);
  }, []);

  if (footer) {
    return (
      <div className='w-full'>
        <div
          className='custom-footer'
          dangerouslySetInnerHTML={{ __html: footer }}
        />
      </div>
    );
  }

  return (
    <footer className='w-full border-t border-border py-6 px-6'>
      <div className='max-w-[1200px] mx-auto flex items-center justify-between'>
        <span className='text-xs text-muted-foreground'>
          © {currentYear} {systemName}
        </span>
        <span className='text-xs text-muted-foreground'>
          Powered by OpenToken
        </span>
      </div>
    </footer>
  );
};

export default FooterBar;
