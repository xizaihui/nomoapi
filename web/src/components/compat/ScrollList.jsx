// Compat layer: Semi Design ScrollList/ScrollItem → pass-through
// These are specialized components used for scroll pickers
import * as React from 'react';
import { cn } from '@/lib/utils';

const ScrollItem = ({ children, className, style, ...rest }) => (
  <div className={cn('overflow-y-auto', className)} style={style} {...rest}>
    {children}
  </div>
);

const ScrollList = ({ children, header, footer, className, style, ...rest }) => (
  <div className={cn('flex', className)} style={style} {...rest}>
    {children}
  </div>
);

export { ScrollList, ScrollItem };
