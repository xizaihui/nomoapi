/*
Copyright (C) 2025 QuantumNous — AGPL-3.0
*/

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Tag, Avatar, Typography, Modal } from '@douyinfe/semi-ui';
import { getLobeHubIcon } from '../../../../../helpers/lobe-icons';
import SearchActions from './SearchActions';

const { Paragraph } = Typography;

const CONFIG = {
  CAROUSEL_INTERVAL: 2000,
  ICON_SIZE: 36,
  UNKNOWN_VENDOR: 'unknown',
};

const getVendorDisplayName = (vendorName, t) =>
  vendorName === CONFIG.UNKNOWN_VENDOR ? t('未知供应商') : vendorName;

const PricingVendorIntro = memo(
  ({
    filterVendor,
    models = [],
    allModels = [],
    t,
    selectedRowKeys = [],
    copyText,
    handleChange,
    handleCompositionStart,
    handleCompositionEnd,
    isMobile = false,
    searchValue = '',
    setShowFilterModal,
    showWithRecharge,
    setShowWithRecharge,
    currency,
    setCurrency,
    showRatio,
    setShowRatio,
    viewMode,
    setViewMode,
    tokenUnit,
    setTokenUnit,
  }) => {
    const [currentOffset, setCurrentOffset] = useState(0);
    const [descModalVisible, setDescModalVisible] = useState(false);
    const [descModalContent, setDescModalContent] = useState('');

    const vendorInfo = useMemo(() => {
      const vendors = new Map();
      let unknownCount = 0;
      const sourceModels =
        Array.isArray(allModels) && allModels.length > 0 ? allModels : models;

      sourceModels.forEach((model) => {
        if (model.vendor_name) {
          const existing = vendors.get(model.vendor_name);
          if (existing) existing.count++;
          else
            vendors.set(model.vendor_name, {
              name: model.vendor_name,
              icon: model.vendor_icon,
              description: model.vendor_description,
              count: 1,
            });
        } else unknownCount++;
      });

      const list = Array.from(vendors.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      if (unknownCount > 0)
        list.push({
          name: CONFIG.UNKNOWN_VENDOR,
          icon: null,
          description: t(
            '包含来自未知或未标明供应商的AI模型，这些模型可能来自小型供应商或开源项目。',
          ),
          count: unknownCount,
        });
      return list;
    }, [allModels, models, t]);

    const currentModelCount = models.length;

    useEffect(() => {
      if (filterVendor !== 'all' || vendorInfo.length <= 1) {
        setCurrentOffset(0);
        return;
      }
      const interval = setInterval(
        () => setCurrentOffset((p) => (p + 1) % vendorInfo.length),
        CONFIG.CAROUSEL_INTERVAL,
      );
      return () => clearInterval(interval);
    }, [filterVendor, vendorInfo.length]);

    const getDescription = useCallback(
      (key) => {
        if (key === 'all')
          return t('查看所有可用的AI模型供应商，包括众多知名供应商的模型。');
        if (key === CONFIG.UNKNOWN_VENDOR)
          return t(
            '包含来自未知或未标明供应商的AI模型，这些模型可能来自小型供应商或开源项目。',
          );
        const v = vendorInfo.find((x) => x.name === key);
        return (
          v?.description ||
          t('该供应商提供多种AI模型，适用于不同的应用场景。')
        );
      },
      [vendorInfo, t],
    );

    const currentVendor =
      filterVendor === 'all'
        ? vendorInfo.length > 0
          ? vendorInfo[currentOffset % vendorInfo.length]
          : null
        : vendorInfo.find((v) => v.name === filterVendor);

    const title =
      filterVendor === 'all'
        ? t('全部供应商')
        : getVendorDisplayName(currentVendor?.name || filterVendor, t);

    const description =
      filterVendor === 'all'
        ? getDescription('all')
        : currentVendor?.description || getDescription(currentVendor?.name);

    const renderIcon = () => {
      if (!currentVendor) return null;
      if (currentVendor.icon)
        return (
          <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center'>
            {getLobeHubIcon(currentVendor.icon, CONFIG.ICON_SIZE)}
          </div>
        );
      return (
        <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground'>
          {currentVendor.name === CONFIG.UNKNOWN_VENDOR
            ? '?'
            : currentVendor.name.charAt(0).toUpperCase()}
        </div>
      );
    };

    const searchActions = (
      <SearchActions
        selectedRowKeys={selectedRowKeys}
        copyText={copyText}
        handleChange={handleChange}
        handleCompositionStart={handleCompositionStart}
        handleCompositionEnd={handleCompositionEnd}
        isMobile={isMobile}
        searchValue={searchValue}
        setShowFilterModal={setShowFilterModal}
        showWithRecharge={showWithRecharge}
        setShowWithRecharge={setShowWithRecharge}
        currency={currency}
        setCurrency={setCurrency}
        showRatio={showRatio}
        setShowRatio={setShowRatio}
        viewMode={viewMode}
        setViewMode={setViewMode}
        tokenUnit={tokenUnit}
        setTokenUnit={setTokenUnit}
        t={t}
      />
    );

    if (!currentVendor && filterVendor !== 'all') return searchActions;

    return (
      <>
        <div className='border border-border/60 rounded-xl overflow-hidden'>
          {/* Header */}
          <div className='px-4 py-3 flex items-center gap-3'>
            {renderIcon()}
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium text-foreground truncate'>
                  {title}
                </span>
                <span className='text-[10px] text-muted-foreground tabular-nums'>
                  {currentModelCount} {t('个模型')}
                </span>
              </div>
              <p
                className='text-xs text-muted-foreground/70 truncate mt-0.5 cursor-pointer hover:text-muted-foreground transition-colors'
                onClick={() => {
                  setDescModalContent(description);
                  setDescModalVisible(true);
                }}
              >
                {description}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className='px-3 pb-3'>{searchActions}</div>
        </div>

        <Modal
          title={t('供应商介绍')}
          visible={descModalVisible}
          onCancel={() => setDescModalVisible(false)}
          footer={null}
          width={isMobile ? '95%' : 600}
        >
          <div className='text-sm'>{descModalContent}</div>
        </Modal>
      </>
    );
  },
);

PricingVendorIntro.displayName = 'PricingVendorIntro';
export default PricingVendorIntro;
