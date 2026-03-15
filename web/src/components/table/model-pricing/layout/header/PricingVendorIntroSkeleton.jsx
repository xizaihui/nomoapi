/*
Copyright (C) 2025 QuantumNous — AGPL-3.0
*/

import React, { memo } from 'react';

const PricingVendorIntroSkeleton = memo(({ isAllVendors = false, isMobile = false }) => {
  return (
    <div className='border border-border/60 rounded-xl overflow-hidden animate-pulse'>
      {/* Header skeleton */}
      <div className='px-4 py-3 flex items-center gap-3'>
        <div className='w-10 h-10 rounded-lg bg-muted' />
        <div className='flex-1 min-w-0 space-y-1.5'>
          <div className='flex items-center gap-2'>
            <div className='h-4 w-24 rounded bg-muted' />
            <div className='h-3 w-16 rounded bg-muted/60' />
          </div>
          <div className='h-3 w-3/4 rounded bg-muted/50' />
        </div>
      </div>
      {/* Search skeleton */}
      <div className='px-3 pb-3 flex items-center gap-2'>
        <div className='flex-1 h-9 rounded-lg bg-muted/60 border border-border/40' />
        <div className='h-9 w-20 rounded-lg bg-muted/40 border border-border/40' />
        {isMobile && <div className='h-9 w-20 rounded-lg bg-muted/40 border border-border/40' />}
      </div>
    </div>
  );
});

PricingVendorIntroSkeleton.displayName = 'PricingVendorIntroSkeleton';
export default PricingVendorIntroSkeleton;
