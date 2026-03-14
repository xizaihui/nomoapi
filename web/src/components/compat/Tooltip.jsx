// Compat layer: Semi Design Tooltip → shadcn/ui Tooltip
import * as React from 'react';
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const Tooltip = ({ content, children, position = 'top', trigger = 'hover', visible, className, style, ...rest }) => {
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

  if (!content) return children;

  return (
    <TooltipProvider delayDuration={200}>
      <ShadcnTooltip open={visible}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={sideMap[position] || 'top'} className={cn(className)} style={style}>
          {content}
        </TooltipContent>
      </ShadcnTooltip>
    </TooltipProvider>
  );
};

export { Tooltip };
export default Tooltip;
