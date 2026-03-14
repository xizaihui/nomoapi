// Compat layer: Semi Design Icon → generic icon wrapper
import * as React from 'react';
import { cn } from '@/lib/utils';

const Icon = React.forwardRef(({ svg, type, size = 'default', spin, className, style, onClick, ...rest }, ref) => {
  const sizeMap = {
    'extra-small': 12,
    small: 14,
    default: 16,
    large: 20,
    'extra-large': 24,
  };
  const px = typeof size === 'number' ? size : (sizeMap[size] || 16);

  if (svg) {
    return (
      <span
        ref={ref}
        className={cn('inline-flex items-center justify-center', spin && 'animate-spin', className)}
        style={{ width: px, height: px, ...style }}
        onClick={onClick}
        {...rest}
      >
        {svg}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      className={cn('inline-flex items-center justify-center', spin && 'animate-spin', className)}
      style={{ width: px, height: px, ...style }}
      onClick={onClick}
      {...rest}
    />
  );
});
Icon.displayName = 'Icon';

export { Icon };
export default Icon;
