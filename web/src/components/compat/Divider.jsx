// Compat layer: Semi Design Divider → shadcn/ui Separator
import * as React from 'react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const Divider = ({ layout = 'horizontal', children, align, dashed, margin, className, style, ...rest }) => {
  if (children) {
    return (
      <div
        className={cn(
          'flex items-center gap-3',
          layout === 'vertical' ? 'flex-col' : 'flex-row',
          className
        )}
        style={{ margin: margin !== undefined ? (typeof margin === 'number' ? `${margin}px 0` : margin) : undefined, ...style }}
        {...rest}
      >
        <Separator orientation={layout} className={cn('flex-1', dashed && 'border-dashed')} />
        <span className='text-xs text-foreground/50 whitespace-nowrap'>{children}</span>
        <Separator orientation={layout} className={cn('flex-1', dashed && 'border-dashed')} />
      </div>
    );
  }

  return (
    <Separator
      orientation={layout}
      className={cn(dashed && 'border-dashed', className)}
      style={{ margin: margin !== undefined ? (typeof margin === 'number' ? `${margin}px 0` : margin) : undefined, ...style }}
      {...rest}
    />
  );
};

export { Divider };
export default Divider;
