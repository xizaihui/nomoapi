/*
Copyright (C) 2025 QuantumNous — AGPL-3.0
*/

import React from 'react';
import {
  Card,
  Button,
  Spin,
  Tabs,
  TabPane,
  Tag,
  Empty,
} from '@douyinfe/semi-ui';
import { RefreshCw } from 'lucide-react';
import {
  IllustrationConstruction,
  IllustrationConstructionDark,
} from '@/components/compat/illustrations';
import ScrollableContainer from '../common/ui/ScrollableContainer';

const UptimePanel = ({
  uptimeData,
  uptimeLoading,
  activeUptimeTab,
  setActiveUptimeTab,
  loadUptimeData,
  uptimeLegendData,
  renderMonitorList,
  CARD_PROPS,
  ILLUSTRATION_SIZE,
  t,
}) => {
  return (
    <div className='border border-border/50 rounded-xl lg:col-span-1'>
      <div className='flex items-center justify-between w-full px-4 pt-4 pb-2'>
        <span className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
          {t('服务可用性')}
        </span>
        <button
          onClick={loadUptimeData}
          disabled={uptimeLoading}
          className='p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30'
        >
          <RefreshCw size={13} className={uptimeLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className='relative'>
        <Spin spinning={uptimeLoading}>
          {uptimeData.length > 0 ? (
            uptimeData.length === 1 ? (
              <ScrollableContainer maxHeight='24rem'>
                {renderMonitorList(uptimeData[0].monitors)}
              </ScrollableContainer>
            ) : (
              <Tabs
                type='card'
                collapsible
                activeKey={activeUptimeTab}
                onChange={setActiveUptimeTab}
                size='small'
              >
                {uptimeData.map((group, groupIdx) => (
                  <TabPane
                    tab={
                      <span className='flex items-center gap-2'>
                        {group.categoryName}
                        <Tag size='small' shape='circle'>
                          {group.monitors ? group.monitors.length : 0}
                        </Tag>
                      </span>
                    }
                    itemKey={group.categoryName}
                    key={groupIdx}
                  >
                    <ScrollableContainer maxHeight='21.5rem'>
                      {renderMonitorList(group.monitors)}
                    </ScrollableContainer>
                  </TabPane>
                ))}
              </Tabs>
            )
          ) : (
            <div className='flex justify-center items-center py-8'>
              <Empty
                image={<IllustrationConstruction style={ILLUSTRATION_SIZE} />}
                darkModeImage={
                  <IllustrationConstructionDark style={ILLUSTRATION_SIZE} />
                }
                title={t('暂无监控数据')}
                description={t('请联系管理员在系统设置中配置Uptime')}
              />
            </div>
          )}
        </Spin>
      </div>

      {uptimeData.length > 0 && (
        <div className='p-3 border-t border-border/50'>
          <div className='flex flex-wrap gap-3 text-[10px] justify-center'>
            {uptimeLegendData.map((legend, index) => (
              <div key={index} className='flex items-center gap-1'>
                <div
                  className='w-1.5 h-1.5 rounded-full'
                  style={{ backgroundColor: legend.color }}
                />
                <span className='text-muted-foreground'>{legend.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UptimePanel;
