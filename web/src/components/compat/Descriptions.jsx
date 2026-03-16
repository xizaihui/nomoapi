// Compat layer: Semi Design Descriptions → definition list
import * as React from 'react';
import { cn } from '@/lib/utils';

const DescriptionsItem = ({ itemKey, children, className, style, span, ...rest }) => {
  return (
    <div
      className={cn('flex flex-col gap-0.5', className)}
      style={{ ...(span ? { gridColumn: `span ${span}` } : {}), ...style }}
      {...rest}
    >
      <dt className='text-xs text-foreground/60'>{itemKey}</dt>
      <dd className='text-sm font-medium'>{children}</dd>
    </div>
  );
};
DescriptionsItem.displayName = 'Descriptions.Item';

const Descriptions = ({ data, row, children, align, size, className, style, ...rest }) => {
  return (
    <dl className={cn('grid gap-2', row ? `grid-cols-${Math.min(row, 4)}` : 'grid-cols-1 sm:grid-cols-2', className)} style={style} {...rest}>
      {data
        ? data.map((item, idx) => (
            <DescriptionsItem key={item.key || idx} itemKey={item.key} span={item.span}>
              {item.value}
            </DescriptionsItem>
          ))
        : children}
    </dl>
  );
};

Descriptions.Item = DescriptionsItem;

export { Descriptions };
export default Descriptions;
