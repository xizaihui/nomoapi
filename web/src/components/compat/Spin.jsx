// Compat layer: Semi Design Spin → simple spinner
import * as React from 'react';
import { cn } from '@/lib/utils';

const Spin = ({ spinning = true, tip, size = 'middle', children, wrapperClassName, style, className, ...rest }) => {
  const sizeMap = {
    small: 'h-4 w-4',
    middle: 'h-6 w-6',
    large: 'h-10 w-10',
  };

  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)} style={style}>
      <svg
        className={cn('animate-spin text-primary', sizeMap[size] || sizeMap.middle)}
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
      >
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
      </svg>
      {tip && <span className='text-sm text-muted-foreground'>{tip}</span>}
    </div>
  );

  if (children) {
    return (
      <div className={cn('relative', wrapperClassName)}>
        {children}
        {spinning && (
          <div className='absolute inset-0 z-10 flex items-center justify-center bg-background/60'>
            {spinner}
          </div>
        )}
      </div>
    );
  }

  return spinning ? spinner : null;
};

export { Spin };
export default Spin;
