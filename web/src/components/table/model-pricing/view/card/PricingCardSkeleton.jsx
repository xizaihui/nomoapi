/*
Copyright (C) 2025 QuantumNous — AGPL-3.0
*/

import React from 'react';

const PricingCardSkeleton = ({ skeletonCount = 12, rowSelection = false, showRatio = false }) => {
  return (
    <div className='px-2 pt-2'>
      <div className='grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3'>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className='border border-border/60 rounded-xl p-4 animate-pulse'>
            <div className='flex items-start gap-3 mb-2'>
              <div className='w-10 h-10 rounded-lg bg-muted' />
              <div className='flex-1 min-w-0 space-y-1.5'>
                <div className='h-4 rounded bg-muted' style={{ width: `${100 + (i % 3) * 30}px` }} />
                <div className='h-3 rounded bg-muted/60' style={{ width: `${140 + (i % 4) * 20}px` }} />
              </div>
            </div>
            <div className='space-y-1.5 mb-2'>
              <div className='h-3 w-full rounded bg-muted/40' />
              <div className='h-3 w-3/4 rounded bg-muted/30' />
            </div>
            <div className='flex gap-1.5'>
              <div className='h-5 w-14 rounded bg-muted/40' />
              <div className='h-5 w-10 rounded bg-muted/30' />
            </div>
            {showRatio && (
              <div className='mt-2 pt-2 border-t border-border/40'>
                <div className='h-3 w-16 rounded bg-muted/40 mb-1.5' />
                <div className='flex gap-4'>
                  <div className='h-3 w-16 rounded bg-muted/30' />
                  <div className='h-3 w-16 rounded bg-muted/30' />
                  <div className='h-3 w-16 rounded bg-muted/30' />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className='flex justify-center mt-6 py-4 border-t border-border/40'>
        <div className='h-8 w-72 rounded bg-muted/40 animate-pulse' />
      </div>
    </div>
  );
};

export default PricingCardSkeleton;
