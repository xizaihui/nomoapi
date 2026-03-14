// Compat layer: Semi Design Empty → simple empty state
import * as React from 'react';
import { cn } from '@/lib/utils';

const Empty = ({ image, title, description, children, darkModeImage, className, style, layout = 'vertical', ...rest }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center py-8',
        layout === 'horizontal' ? 'flex-row gap-4' : 'flex-col gap-2',
        className
      )}
      style={style}
      {...rest}
    >
      {image && <div className='text-muted-foreground'>{typeof image === 'string' ? <img src={image} alt='' className='h-24 w-24 opacity-50' /> : image}</div>}
      {title && <div className='text-base font-medium text-foreground'>{title}</div>}
      {description && <div className='text-sm text-muted-foreground'>{description}</div>}
      {children && <div className='mt-2'>{children}</div>}
    </div>
  );
};

export { Empty };
export default Empty;
