// Compat layer: Semi Design Space → flex gap wrapper
import * as React from 'react';
import { cn } from '@/lib/utils';

const SPACING_MAP = {
  tight: 'gap-1',
  small: 'gap-2',
  medium: 'gap-3',
  large: 'gap-4',
  loose: 'gap-6',
};

const Space = React.forwardRef(
  ({ children, spacing = 'small', align, vertical, wrap, className, style, ...rest }, ref) => {
    const gapClass = typeof spacing === 'string' ? (SPACING_MAP[spacing] || 'gap-2') : '';
    const gapStyle = typeof spacing === 'number' ? { gap: `${spacing}px` } : {};

    const alignMap = {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      baseline: 'items-baseline',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          vertical ? 'flex-col' : 'flex-row',
          gapClass,
          alignMap[align] || 'items-center',
          wrap && 'flex-wrap',
          className
        )}
        style={{ ...gapStyle, ...style }}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
Space.displayName = 'Space';

export { Space };
export default Space;
