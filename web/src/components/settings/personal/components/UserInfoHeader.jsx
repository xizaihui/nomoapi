/*
Copyright (C) 2025 QuantumNous — AGPL-3.0
*/

import React from 'react';
import { Avatar, Typography } from '@douyinfe/semi-ui';
import {
  isRoot,
  isAdmin,
  renderQuota,
  stringToColor,
} from '../../../../helpers';
import { Coins, BarChart2, Users, Hash } from 'lucide-react';

const UserInfoHeader = ({ t, userState }) => {
  const username = userState?.user?.username || 'null';
  const avatarText = username.length > 0 ? username.slice(0, 2).toUpperCase() : 'NA';
  const roleLabel = isRoot() ? t('超级管理员') : isAdmin() ? t('管理员') : t('普通用户');

  const stats = [
    { icon: Coins, label: t('当前余额'), value: renderQuota(userState?.user?.quota), highlight: true },
    { icon: Coins, label: t('历史消耗'), value: renderQuota(userState?.user?.used_quota) },
    { icon: BarChart2, label: t('请求次数'), value: userState?.user?.request_count || 0 },
    { icon: Users, label: t('用户分组'), value: userState?.user?.group || t('默认') },
  ];

  return (
    <div className='border border-border/60 rounded-xl overflow-hidden'>
      {/* Profile row */}
      <div className='px-5 py-4 flex items-center gap-4'>
        <Avatar size='large' color={stringToColor(username)}>
          {avatarText}
        </Avatar>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <span className='text-base font-medium text-foreground truncate'>{username}</span>
            <span className='text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground'>
              {roleLabel}
            </span>
            <span className='text-[10px] text-muted-foreground/60'>
              ID: {userState?.user?.id}
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className='border-t border-border/40 grid grid-cols-2 lg:grid-cols-4'>
        {stats.map((s, i) => (
          <div
            key={i}
            className={`px-5 py-3 ${i > 0 ? 'border-l border-border/40' : ''} ${i >= 2 ? 'max-lg:border-t max-lg:border-border/40' : ''}`}
          >
            <div className='flex items-center gap-1.5 mb-1'>
              <s.icon size={12} className='text-muted-foreground/60' />
              <span className='text-[10px] uppercase tracking-wider text-muted-foreground/60'>{s.label}</span>
            </div>
            <span className={`text-sm font-medium tabular-nums ${s.highlight ? 'text-foreground' : 'text-foreground/80'}`}>
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserInfoHeader;
