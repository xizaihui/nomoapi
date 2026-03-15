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

import React from 'react';
import { Skeleton } from '@douyinfe/semi-ui';
import { VChart } from '@visactor/react-vchart';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// 卡片主题色
const CARD_THEMES = {
  0: {
    gradient: 'from-blue-500/10 via-blue-400/5 to-transparent',
    darkGradient: 'dark:from-blue-500/15 dark:via-blue-400/5 dark:to-transparent',
    accent: 'bg-blue-500',
    headerText: 'text-blue-700 dark:text-blue-300',
  },
  1: {
    gradient: 'from-emerald-500/10 via-emerald-400/5 to-transparent',
    darkGradient: 'dark:from-emerald-500/15 dark:via-emerald-400/5 dark:to-transparent',
    accent: 'bg-emerald-500',
    headerText: 'text-emerald-700 dark:text-emerald-300',
  },
  2: {
    gradient: 'from-amber-500/10 via-amber-400/5 to-transparent',
    darkGradient: 'dark:from-amber-500/15 dark:via-amber-400/5 dark:to-transparent',
    accent: 'bg-amber-500',
    headerText: 'text-amber-700 dark:text-amber-300',
  },
  3: {
    gradient: 'from-indigo-500/10 via-indigo-400/5 to-transparent',
    darkGradient: 'dark:from-indigo-500/15 dark:via-indigo-400/5 dark:to-transparent',
    accent: 'bg-indigo-500',
    headerText: 'text-indigo-700 dark:text-indigo-300',
  },
};

// 图标颜色映射
const ICON_STYLES = {
  blue: 'text-blue-600 dark:text-blue-400',
  purple: 'text-purple-600 dark:text-purple-400',
  green: 'text-emerald-600 dark:text-emerald-400',
  cyan: 'text-cyan-600 dark:text-cyan-400',
  yellow: 'text-amber-600 dark:text-amber-400',
  pink: 'text-pink-600 dark:text-pink-400',
  indigo: 'text-indigo-600 dark:text-indigo-400',
  orange: 'text-orange-600 dark:text-orange-400',
};

const StatsCards = ({
  groupedStatsData,
  loading,
  getTrendSpec,
  CARD_PROPS,
  CHART_CONFIG,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className='mb-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {groupedStatsData.map((group, idx) => {
          const theme = CARD_THEMES[idx] || CARD_THEMES[0];
          return (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${theme.gradient} ${theme.darkGradient} bg-card`}
            >
              {/* 顶部装饰条 */}
              <div className={`h-1 ${theme.accent}`} />

              {/* 标题区 */}
              <div className={`px-5 pt-4 pb-2 flex items-center gap-2 text-sm font-semibold ${theme.headerText}`}>
                {group.title}
              </div>

              {/* 数据区 */}
              <div className='px-5 pb-5 space-y-4'>
                {group.items.map((item, itemIdx) => {
                  const iconStyle = ICON_STYLES[item.avatarColor] || ICON_STYLES.blue;
                  const hasTrend = !loading && item.trendData && item.trendData.length > 0;
                  const isBalance = item.title === t('当前余额');

                  return (
                    <div
                      key={itemIdx}
                      className='flex items-center justify-between cursor-pointer group'
                      onClick={item.onClick}
                    >
                      <div className='flex items-center gap-3 min-w-0'>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-background/60 backdrop-blur-sm border border-border/30 flex-shrink-0 transition-all group-hover:scale-110 group-hover:shadow-sm ${iconStyle}`}>
                          {item.icon}
                        </div>
                        <div className='min-w-0'>
                          <div className='text-xs text-muted-foreground/80 truncate'>{item.title}</div>
                          <div className='text-base font-bold tracking-tight truncate'>
                            <Skeleton
                              loading={loading}
                              active
                              placeholder={
                                <Skeleton.Paragraph
                                  active
                                  rows={1}
                                  style={{ width: '60px', height: '20px', marginTop: '2px' }}
                                />
                              }
                            >
                              {item.value}
                            </Skeleton>
                          </div>
                        </div>
                      </div>

                      {/* 右侧：充值按钮或趋势图 */}
                      {isBalance ? (
                        <button
                          className='flex-shrink-0 px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors'
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/console/topup');
                          }}
                        >
                          {t('充值')}
                        </button>
                      ) : hasTrend ? (
                        <div className='w-20 h-8 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity'>
                          <VChart
                            spec={getTrendSpec(item.trendData, item.trendColor)}
                            option={CHART_CONFIG}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsCards;
