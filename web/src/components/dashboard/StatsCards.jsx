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
import { ArrowUpRight } from 'lucide-react';

const StatsCards = ({
  groupedStatsData,
  loading,
  getTrendSpec,
  CARD_PROPS,
  CHART_CONFIG,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 扁平化所有 items
  const allItems = groupedStatsData.flatMap((group) =>
    group.items.map((item) => ({ ...item, groupTitle: group.title }))
  );

  return (
    <div className='mb-6'>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border'>
        {allItems.map((item, idx) => {
          const hasTrend = !loading && item.trendData && item.trendData.length > 0;
          const isBalance = item.title === t('当前余额');

          return (
            <div
              key={idx}
              className='bg-card px-4 py-4 flex flex-col justify-between min-h-[100px] cursor-pointer hover:bg-muted/30 transition-all duration-200 stagger-item'
              onClick={item.onClick}
            >
              <div className='flex items-center justify-between'>
                <span className='text-xs text-foreground/55 font-medium uppercase tracking-wide'>
                  {item.title}
                </span>
                {isBalance && (
                  <button
                    className='text-xs text-foreground/50 hover:text-foreground transition-colors flex items-center gap-0.5'
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/console/topup');
                    }}
                  >
                    {t('充值')}
                    <ArrowUpRight className='w-3 h-3' />
                  </button>
                )}
              </div>

              <div className='flex items-end justify-between mt-2'>
                <div className='text-2xl font-semibold tracking-tight text-foreground'>
                  <Skeleton
                    loading={loading}
                    active
                    placeholder={
                      <Skeleton.Paragraph
                        active
                        rows={1}
                        style={{ width: '60px', height: '28px' }}
                      />
                    }
                  >
                    {item.value}
                  </Skeleton>
                </div>

                {hasTrend && (
                  <div className='w-16 h-6 opacity-40'>
                    <VChart
                      spec={{
                        ...getTrendSpec(item.trendData, 'hsl(var(--foreground))'),
                        height: 24,
                        width: 64,
                      }}
                      option={CHART_CONFIG}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsCards;
