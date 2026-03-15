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
import { Card, Skeleton, Tag } from '@douyinfe/semi-ui';
import { VChart } from '@visactor/react-vchart';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// 图标颜色映射
const ICON_COLORS = {
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-600 dark:text-purple-400' },
  green: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-600 dark:text-green-400' },
  cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-600 dark:text-cyan-400' },
  yellow: { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-400' },
  pink: { bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-600 dark:text-pink-400' },
  indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-600 dark:text-indigo-400' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-600 dark:text-orange-400' },
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
        {groupedStatsData.map((group, idx) => (
          <Card
            key={idx}
            {...CARD_PROPS}
            className={`${group.color} dark:bg-card border-0 !rounded-2xl w-full`}
            title={group.title}
          >
            <div className='space-y-5 pt-2'>
              {group.items.map((item, itemIdx) => {
                const iconColor = ICON_COLORS[item.avatarColor] || ICON_COLORS.blue;
                return (
                  <div
                    key={itemIdx}
                    className='flex items-center justify-between cursor-pointer group'
                    onClick={item.onClick}
                  >
                    <div className='flex items-center gap-3'>
                      <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${iconColor.bg} ${iconColor.text} flex-shrink-0 transition-transform group-hover:scale-105`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className='text-xs text-muted-foreground leading-relaxed'>{item.title}</div>
                        <div className='text-lg font-semibold leading-snug'>
                          <Skeleton
                            loading={loading}
                            active
                            placeholder={
                              <Skeleton.Paragraph
                                active
                                rows={1}
                                style={{
                                  width: '65px',
                                  height: '24px',
                                  marginTop: '4px',
                                }}
                              />
                            }
                          >
                            {item.value}
                          </Skeleton>
                        </div>
                      </div>
                    </div>
                    {item.title === t('当前余额') ? (
                      <Tag
                        color='white'
                        shape='circle'
                        size='large'
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/console/topup');
                        }}
                      >
                        {t('充值')}
                      </Tag>
                    ) : (
                      (loading ||
                        (item.trendData && item.trendData.length > 0)) && (
                        <div className='w-24 h-10'>
                          <VChart
                            spec={getTrendSpec(item.trendData, item.trendColor)}
                            option={CHART_CONFIG}
                          />
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
