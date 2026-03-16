/*
Copyright (C) 2025 QuantumNous — AGPL-3.0
*/

import React from 'react';
import { Link } from 'react-router-dom';
import SkeletonWrapper from '../components/SkeletonWrapper';

const HeaderLogo = ({
  isMobile,
  isConsoleRoute,
  logo,
  logoLoaded,
  isLoading,
  systemName,
  isSelfUseMode,
  isDemoSiteMode,
  t,
}) => {
  if (isMobile && isConsoleRoute) {
    return null;
  }

  return (
    <Link to='/' className='group flex items-center gap-2.5'>
      <div className='relative w-7 h-7'>
        <SkeletonWrapper loading={isLoading || !logoLoaded} type='image' />
        <img
          src={logo}
          alt='logo'
          className={`absolute inset-0 w-full h-full transition-opacity duration-200 rounded-full ${!isLoading && logoLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      <div className='hidden md:flex items-center gap-2'>
        <span className='text-sm font-semibold tracking-tight text-foreground'>
          {systemName}
        </span>
        {isSelfUseMode && !isLoading && (
          <span className='text-[10px] text-foreground/45 border border-border rounded px-1 py-0.5 leading-none'>
            {t('自用模式')}
          </span>
        )}
        {isDemoSiteMode && !isLoading && (
          <span className='text-[10px] text-foreground/45 border border-border rounded px-1 py-0.5 leading-none'>
            {t('演示站点')}
          </span>
        )}
      </div>
    </Link>
  );
};

export default HeaderLogo;
