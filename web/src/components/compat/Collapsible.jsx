// Compat layer: Semi Design Collapsible → simple collapsible wrapper
import * as React from 'react';
import { cn } from '@/lib/utils';

const Collapsible = ({ isOpen = true, keepDOM = false, children, className, style, ...rest }) => {
  if (!keepDOM && !isOpen) return null;

  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-200',
        !isOpen && 'h-0 opacity-0',
        isOpen && 'h-auto opacity-100',
        className
      )}
      style={{ display: !keepDOM && !isOpen ? 'none' : undefined, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
};

export { Collapsible };
export default Collapsible;
