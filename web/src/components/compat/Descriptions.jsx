// Compat layer: Semi Design Descriptions → definition list
import * as React from 'react';
import { cn } from '@/lib/utils';

const Descriptions = ({ data, row, children, align, size, className, style, ...rest }) => {
  // Semi Descriptions accepts `data` as array of { key, value } or children
  return (
    <dl className={cn('grid gap-2', row ? `grid-cols-${Math.min(row, 4)}` : 'grid-cols-1 sm:grid-cols-2', className)} style={style} {...rest}>
      {data
        ? data.map((item, idx) => (
            <div key={item.key || idx} className='flex flex-col gap-0.5' style={item.span ? { gridColumn: `span ${item.span}` } : undefined}>
              <dt className='text-xs text-muted-foreground'>{item.key}</dt>
              <dd className='text-sm font-medium'>{item.value}</dd>
            </div>
          ))
        : children}
    </dl>
  );
};

export { Descriptions };
export default Descriptions;
