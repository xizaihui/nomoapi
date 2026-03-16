// Compat layer: Semi Design Timeline → vertical timeline
import * as React from 'react';
import { cn } from '@/lib/utils';

const Timeline = ({ children, mode = 'left', className, style, ...rest }) => (
  <div className={cn('relative', className)} style={style} {...rest}>
    {children}
  </div>
);

const Item = ({ children, time, type, color, dot, extra, className, style, ...rest }) => {
  const colorMap = {
    default: 'bg-muted-foreground',
    ongoing: 'bg-primary',
    success: 'bg-[hsl(var(--chart-2))]',
    warning: 'bg-[hsl(var(--chart-4))]',
    error: 'bg-destructive',
  };

  return (
    <div className={cn('flex gap-3 pb-4', className)} style={style} {...rest}>
      <div className='flex flex-col items-center'>
        {dot || (
          <div className={cn('h-3 w-3 rounded-full mt-1', color ? '' : (colorMap[type] || colorMap.default))} style={color ? { backgroundColor: color } : undefined} />
        )}
        <div className='flex-1 w-px bg-border mt-1' />
      </div>
      <div className='flex-1 min-w-0 pb-2'>
        {time && <div className='text-xs text-foreground/55 mb-1'>{time}</div>}
        <div className='text-sm'>{children}</div>
        {extra && <div className='mt-1'>{extra}</div>}
      </div>
    </div>
  );
};
Item.displayName = 'Item';

Timeline.Item = Item;

export { Timeline };
export default Timeline;
