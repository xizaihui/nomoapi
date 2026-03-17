/*
Copyright (C) 2025 QuantumNous — AGPL-3.0
*/

import React from 'react';
import {
  Tag,
  Tooltip,
  Checkbox,
  Empty,
  Pagination,
  Button,
} from '@douyinfe/semi-ui';
import { IconHelpCircle } from '@/components/compat/icons';
import { Copy } from 'lucide-react';
import {
  IllustrationNoResult,
  IllustrationNoResultDark,
} from '@/components/compat/illustrations';
import {
  stringToColor,
  calculateModelPrice,
  formatPriceInfo,
} from '../../../../../helpers';
import { getLobeHubIcon } from '../../../../../helpers/lobe-icons';
import PricingCardSkeleton from './PricingCardSkeleton';
import { useMinimumLoadingTime } from '../../../../../hooks/common/useMinimumLoadingTime';
import { renderLimitedItems } from '../../../../common/ui/RenderUtils';
import { useIsMobile } from '../../../../../hooks/common/useIsMobile';

const PricingCardView = ({
  filteredModels,
  loading,
  rowSelection,
  pageSize,
  setPageSize,
  currentPage,
  setCurrentPage,
  selectedGroup,
  groupRatio,
  copyText,
  setModalImageUrl,
  setIsModalOpenurl,
  currency,
  siteDisplayType,
  tokenUnit,
  displayPrice,
  showRatio,
  t,
  selectedRowKeys = [],
  setSelectedRowKeys,
  openModelDetail,
}) => {
  const showSkeleton = useMinimumLoadingTime(loading);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedModels = filteredModels.slice(startIndex, startIndex + pageSize);
  const getModelKey = (model) => model.key ?? model.model_name ?? model.id;
  const isMobile = useIsMobile();

  const handleCheckboxChange = (model, checked) => {
    if (!setSelectedRowKeys) return;
    const modelKey = getModelKey(model);
    const newKeys = checked
      ? Array.from(new Set([...selectedRowKeys, modelKey]))
      : selectedRowKeys.filter((key) => key !== modelKey);
    setSelectedRowKeys(newKeys);
    rowSelection?.onChange?.(newKeys, null);
  };

  const getModelIcon = (model) => {
    if (!model?.model_name) {
      return <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground'>?</div>;
    }
    if (model.icon) {
      return <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center'>{getLobeHubIcon(model.icon, 28)}</div>;
    }
    if (model.vendor_icon) {
      return <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center'>{getLobeHubIcon(model.vendor_icon, 28)}</div>;
    }
    return (
      <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground'>
        {model.model_name.slice(0, 2).toUpperCase()}
      </div>
    );
  };

  const renderBillingTag = (record) => {
    if (record.quota_type === 1) return <span className='text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground'>{t('按次计费')}</span>;
    if (record.quota_type === 0) return <span className='text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground'>{t('按量计费')}</span>;
    return null;
  };

  const renderCustomTags = (record) => {
    if (!record.tags) return null;
    const tags = record.tags.split(',').filter(Boolean);
    if (tags.length === 0) return null;
    return tags.slice(0, 3).map((tg, idx) => (
      <span key={idx} className='text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground'>{tg}</span>
    ));
  };

  if (showSkeleton) {
    return <PricingCardSkeleton rowSelection={!!rowSelection} showRatio={showRatio} />;
  }

  if (!filteredModels || filteredModels.length === 0) {
    return (
      <div className='flex justify-center items-center py-20'>
        <Empty
          image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
          darkModeImage={<IllustrationNoResultDark style={{ width: 150, height: 150 }} />}
          description={t('搜索无结果')}
        />
      </div>
    );
  }

  return (
    <div className='px-2 pt-2'>
      <div className='grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3'>
        {paginatedModels.map((model, index) => {
          const modelKey = getModelKey(model);
          const isSelected = selectedRowKeys.includes(modelKey);
          const priceData = calculateModelPrice({
            record: model, selectedGroup, groupRatio, tokenUnit, displayPrice, currency, quotaDisplayType: siteDisplayType,
          });

          return (
            <div
              key={modelKey || index}
              className={`border rounded-xl p-4 transition-colors cursor-pointer ${isSelected ? 'border-foreground/30 bg-muted/30' : 'border-border/60 hover:border-foreground/20'}`}
              onClick={() => openModelDetail?.(model)}
            >
              {/* Header: icon + name + actions */}
              <div className='flex items-start gap-3 mb-2'>
                {getModelIcon(model)}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium text-foreground truncate'>{model.model_name}</span>
                    <Button
                      size='small'
                      theme='borderless'
                      type='tertiary'
                      icon={<Copy size={12} />}
                      className='!h-5 !w-5 !p-0 !min-w-0 text-muted-foreground hover:text-foreground'
                      onClick={(e) => { e.stopPropagation(); copyText(model.model_name); }}
                    />
                    {rowSelection && (
                      <Checkbox
                        checked={isSelected}
                        className='ml-auto'
                        onChange={(e) => { e.stopPropagation(); handleCheckboxChange(model, e.target.checked); }}
                      />
                    )}
                  </div>
                  <div className='text-[11px] text-muted-foreground mt-0.5'>
                    {formatPriceInfo(priceData, t, siteDisplayType)}
                  </div>
                </div>
              </div>

              {/* Description */}
              {model.description && (
                <p className='text-xs text-muted-foreground/70 line-clamp-2 leading-relaxed mb-2'>
                  {model.description}
                </p>
              )}

              {/* Tags */}
              <div className='flex items-center gap-1.5 flex-wrap'>
                {renderBillingTag(model)}
                {renderCustomTags(model)}
              </div>

              {/* Ratio info */}
              {showRatio && (
                <div className='mt-2 pt-2 border-t border-border/40'>
                  <div className='flex items-center gap-1 mb-1'>
                    <span className='text-[10px] uppercase tracking-wider text-muted-foreground/60'>{t('倍率信息')}</span>
                    <Tooltip content={t('倍率是为了方便换算不同价格的模型')}>
                      <IconHelpCircle
                        className='text-muted-foreground/60 cursor-pointer'
                        size='extra-small'
                        onClick={(e) => { e.stopPropagation(); setModalImageUrl('/ratio.png'); setIsModalOpenurl(true); }}
                      />
                    </Tooltip>
                  </div>
                  <div className='flex gap-4 text-[11px] text-muted-foreground'>
                    <span>{t('模型')}: {model.quota_type === 0 ? model.model_ratio : '-'}</span>
                    <span>{t('补全')}: {model.quota_type === 0 ? parseFloat(model.completion_ratio.toFixed(3)) : '-'}</span>
                    <span>{t('分组')}: {priceData?.usedGroupRatio ?? '-'}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredModels.length > 0 && (
        <div className='flex justify-center mt-6 py-4 border-t border-border/40'>
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            total={filteredModels.length}
            showSizeChanger
            pageSizeOptions={[10, 20, 50, 100]}
            size={isMobile ? 'small' : 'default'}
            showQuickJumper={isMobile}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          />
        </div>
      )}
    </div>
  );
};

export default PricingCardView;
