// Compat layer: Semi Design Popover → shadcn/ui Popover
import * as React from 'react';
import {
  Popover as ShadcnPopover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const Popover = ({ content, children, trigger = 'click', position = 'bottom', visible, onVisibleChange, showArrow, className, style, ...rest }) => {
  const sideMap = {
    top: 'top',
    bottom: 'bottom',
    left: 'left',
    right: 'right',
    topLeft: 'top',
    topRight: 'top',
    bottomLeft: 'bottom',
    bottomRight: 'bottom',
    leftTop: 'left',
    leftBottom: 'left',
    rightTop: 'right',
    rightBottom: 'right',
  };

  return (
    <ShadcnPopover open={visible} onOpenChange={onVisibleChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side={sideMap[position] || 'bottom'} className={cn(className)} style={style}>
        {content}
      </PopoverContent>
    </ShadcnPopover>
  );
};

export { Popover };
export default Popover;
