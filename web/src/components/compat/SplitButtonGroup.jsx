// Compat layer: Semi Design SplitButtonGroup → button group wrapper
import * as React from 'react';
import { cn } from '@/lib/utils';

const SplitButtonGroup = ({ children, className, style, ...rest }) => (
  <div
    className={cn('inline-flex [&>button:not(:first-child):not(:last-child)]:rounded-none [&>button:first-child]:rounded-r-none [&>button:last-child]:rounded-l-none [&>button+button]:border-l-0', className)}
    style={style}
    role='group'
    {...rest}
  >
    {children}
  </div>
);

export { SplitButtonGroup };
export default SplitButtonGroup;
