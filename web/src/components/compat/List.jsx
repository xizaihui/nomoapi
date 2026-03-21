// Compat layer: Semi Design List → simple list
import * as React from 'react';
import { cn } from '@/lib/utils';

const List = ({ dataSource, renderItem, header, footer, emptyContent, loading, size, split = true, layout = 'vertical', className, style, children, ...rest }) => {
  return (
    <div className={cn('w-full', className)} style={style} {...rest}>
      {header && <div className='px-4 py-2 font-medium border-b'>{header}</div>}
      {loading ? (
        <div className='flex items-center justify-center py-8'>
          <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
        </div>
      ) : (
        <ul className={cn('divide-y', layout === 'horizontal' && 'flex flex-wrap divide-y-0 divide-x')}>
          {dataSource && dataSource.length > 0
            ? dataSource.map((item, idx) => renderItem ? renderItem(item, idx) : null)
            : children || (emptyContent && <li className='py-8 text-center text-muted-foreground'>{emptyContent}</li>)
          }
        </ul>
      )}
      {footer && <div className='px-4 py-2 border-t'>{footer}</div>}
    </div>
  );
};

const Item = ({ children, header, main, extra, align, className, style, ...rest }) => (
  <li className={cn('flex items-start gap-3 px-4 py-3', className)} style={style} {...rest}>
    <div className='flex-1'>
      {header && <div className='font-medium'>{header}</div>}
      {main || children}
    </div>
    {extra && <div>{extra}</div>}
  </li>
);

List.Item = Item;

export { List };
export default List;
