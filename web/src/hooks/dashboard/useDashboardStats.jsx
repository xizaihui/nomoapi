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

import { useMemo } from 'react';
import { Wallet, Activity, Zap, Gauge } from 'lucide-react';
import {
  IconMoneyExchangeStroked,
  IconHistogram,
  IconCoinMoneyStroked,
  IconTextStroked,
  IconPulse,
  IconStopwatchStroked,
  IconTypograph,
  IconSend,
} from '@/components/compat/icons';
import { renderQuota } from '../../helpers';
import { createSectionTitle } from '../../helpers/dashboard';

export const useDashboardStats = (
  userState,
  consumeQuota,
  consumeTokens,
  times,
  trendData,
  performanceMetrics,
  navigate,
  t,
) => {
  const groupedStatsData = useMemo(
    () => [
      {
        title: createSectionTitle(Wallet, t('账户数据')),
        color: 'bg-muted/30',
        items: [
          {
            title: t('当前余额'),
            value: renderQuota(userState?.user?.quota),
            icon: <IconMoneyExchangeStroked />,
            avatarColor: 'grey',
            trendData: [],
            trendColor: '#4a5c6e',
          },
          {
            title: t('历史消耗'),
            value: renderQuota(userState?.user?.used_quota),
            icon: <IconHistogram />,
            avatarColor: 'light-grey',
            trendData: [],
            trendColor: '#587082',
          },
        ],
      },
      {
        title: createSectionTitle(Activity, t('使用统计')),
        color: 'bg-muted/30',
        items: [
          {
            title: t('请求次数'),
            value: userState.user?.request_count,
            icon: <IconSend />,
            avatarColor: 'grey',
            trendData: [],
            trendColor: '#6b7f8f',
          },
          {
            title: t('统计次数'),
            value: times,
            icon: <IconPulse />,
            avatarColor: 'light-grey',
            trendData: trendData.times,
            trendColor: '#7a919f',
          },
        ],
      },
      {
        title: createSectionTitle(Zap, t('资源消耗')),
        color: 'bg-muted/30',
        items: [
          {
            title: t('统计额度'),
            value: renderQuota(consumeQuota),
            icon: <IconCoinMoneyStroked />,
            avatarColor: 'grey',
            trendData: trendData.consumeQuota,
            trendColor: '#8fa0ae',
          },
          {
            title: t('统计Tokens'),
            value: isNaN(consumeTokens) ? 0 : consumeTokens.toLocaleString(),
            icon: <IconTextStroked />,
            avatarColor: 'light-grey',
            trendData: trendData.tokens,
            trendColor: '#9db0bc',
          },
        ],
      },
      {
        title: createSectionTitle(Gauge, t('性能指标')),
        color: 'bg-muted/30',
        items: [
          {
            title: t('平均RPM'),
            value: performanceMetrics.avgRPM,
            icon: <IconStopwatchStroked />,
            avatarColor: 'grey',
            trendData: trendData.rpm,
            trendColor: '#3a4d5e',
          },
          {
            title: t('平均TPM'),
            value: performanceMetrics.avgTPM,
            icon: <IconTypograph />,
            avatarColor: 'light-grey',
            trendData: trendData.tpm,
            trendColor: '#b3c2cc',
          },
        ],
      },
    ],
    [
      userState?.user?.quota,
      userState?.user?.used_quota,
      userState?.user?.request_count,
      times,
      consumeQuota,
      consumeTokens,
      trendData,
      performanceMetrics,
      navigate,
      t,
    ],
  );

  return {
    groupedStatsData,
  };
};
