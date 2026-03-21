// Compat layer: Semi Design Progress → shadcn/ui Progress
import * as React from 'react';
import { Progress as ShadcnProgress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const Progress = ({ percent = 0, type = 'line', showInfo = true, size = 'default', stroke, format, className, style, ...rest }) => {
  if (type === 'circle') {
    const r = 40;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (percent / 100) * circumference;
    return (
      <div className={cn('inline-flex flex-col items-center gap-1', className)} style={style}>
        <svg width='100' height='100' viewBox='0 0 100 100'>
          <circle cx='50' cy='50' r={r} fill='none' stroke='hsl(var(--muted))' strokeWidth='8' />
          <circle
            cx='50' cy='50' r={r} fill='none'
            stroke={stroke || 'hsl(var(--primary))'}
            strokeWidth='8' strokeLinecap='round'
            strokeDasharray={circumference} strokeDashoffset={offset}
            transform='rotate(-90 50 50)'
            className='transition-all duration-300'
          />
          {showInfo && (
            <text x='50' y='50' textAnchor='middle' dominantBaseline='central' className='fill-foreground text-sm font-medium'>
              {format ? format(percent) : `${Math.round(percent)}%`}
            </text>
          )}
        </svg>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)} style={style}>
      <ShadcnProgress
        value={percent}
        className={cn(size === 'small' ? 'h-1.5' : size === 'large' ? 'h-4' : 'h-2', 'flex-1')}
        {...rest}
      />
      {showInfo && (
        <span className='text-xs text-muted-foreground whitespace-nowrap'>
          {format ? format(percent) : `${Math.round(percent)}%`}
        </span>
      )}
    </div>
  );
};

export { Progress };
export default Progress;
