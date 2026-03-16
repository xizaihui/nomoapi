// Compat layer: Semi Design Badge → shadcn/ui Badge (dot/count)
import * as React from 'react';
import { cn } from '@/lib/utils';

const SemiBadge = ({ count, dot, maxCount = 99, overflowCount, type = 'danger', children, position, theme, className, style, ...rest }) => {
  const max = overflowCount || maxCount;
  const colorMap = {
    danger: 'bg-destructive text-destructive-foreground',
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    tertiary: 'bg-muted text-foreground/60',
    warning: 'bg-[hsl(var(--chart-4))] text-white',
    success: 'bg-[hsl(var(--chart-2))] text-white',
  };

  if (!children) {
    if (dot) return <span className={cn('inline-block h-2 w-2 rounded-full', colorMap[type], className)} style={style} />;
    if (count !== undefined && count > 0) {
      return (
        <span className={cn('inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium', colorMap[type], className)} style={style}>
          {count > max ? `${max}+` : count}
        </span>
      );
    }
    return null;
  }

  return (
    <div className={cn('relative inline-flex', className)} style={style} {...rest}>
      {children}
      {dot && (
        <span className={cn('absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full', colorMap[type])} />
      )}
      {!dot && count !== undefined && count > 0 && (
        <span className={cn('absolute -top-2 -right-2 inline-flex items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-medium leading-none min-w-[16px]', colorMap[type])}>
          {count > max ? `${max}+` : count}
        </span>
      )}
    </div>
  );
};

export { SemiBadge as Badge };
export default SemiBadge;
