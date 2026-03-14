// Compat layer: Semi Design InputGroup → simple flex wrapper
import * as React from 'react';
import { cn } from '@/lib/utils';

const InputGroup = ({ children, className, style, ...rest }) => (
  <div
    className={cn('flex items-center [&>*:not(:first-child):not(:last-child)]:rounded-none [&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none', className)}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

export { InputGroup };
export default InputGroup;
