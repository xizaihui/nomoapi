// Compat layer: Semi Design AvatarGroup → avatar stack
import * as React from 'react';
import { cn } from '@/lib/utils';

const AvatarGroup = ({ children, maxCount, size, overlapFrom = 'start', className, style, ...rest }) => {
  const items = React.Children.toArray(children);
  const visible = maxCount ? items.slice(0, maxCount) : items;
  const overflow = maxCount ? items.length - maxCount : 0;

  return (
    <div className={cn('flex -space-x-2', className)} style={style} {...rest}>
      {visible}
      {overflow > 0 && (
        <span className='inline-flex items-center justify-center rounded-full bg-muted text-xs font-medium h-8 w-8 border-2 border-background'>
          +{overflow}
        </span>
      )}
    </div>
  );
};

export { AvatarGroup };
export default AvatarGroup;
