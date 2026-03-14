// Compat layer: Semi Design Skeleton → shadcn/ui Skeleton
import * as React from 'react';
import { Skeleton as ShadcnSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const Skeleton = ({ placeholder, loading = true, active = true, children, className, style, ...rest }) => {
  if (!loading) return children || null;

  if (placeholder) return placeholder;

  return (
    <div className={cn('space-y-3', className)} style={style} {...rest}>
      <ShadcnSkeleton className='h-4 w-3/4' />
      <ShadcnSkeleton className='h-4 w-1/2' />
      <ShadcnSkeleton className='h-4 w-5/6' />
    </div>
  );
};

// Semi Skeleton.Paragraph / Skeleton.Title / Skeleton.Avatar / Skeleton.Image / Skeleton.Button
Skeleton.Paragraph = ({ rows = 3, className, style }) => (
  <div className={cn('space-y-2', className)} style={style}>
    {Array.from({ length: rows }).map((_, i) => (
      <ShadcnSkeleton key={i} className={cn('h-4', i === rows - 1 ? 'w-3/5' : 'w-full')} />
    ))}
  </div>
);

Skeleton.Title = ({ className, style }) => (
  <ShadcnSkeleton className={cn('h-6 w-2/5', className)} style={style} />
);

Skeleton.Avatar = ({ size = 'default', shape = 'circle', className, style }) => {
  const sizeMap = { small: 'h-8 w-8', default: 'h-10 w-10', large: 'h-16 w-16' };
  return (
    <ShadcnSkeleton
      className={cn(sizeMap[size] || sizeMap.default, shape === 'square' ? 'rounded-md' : 'rounded-full', className)}
      style={style}
    />
  );
};

Skeleton.Image = ({ className, style }) => (
  <ShadcnSkeleton className={cn('h-24 w-24 rounded-md', className)} style={style} />
);

Skeleton.Button = ({ className, style }) => (
  <ShadcnSkeleton className={cn('h-10 w-24 rounded-md', className)} style={style} />
);

export { Skeleton };
export default Skeleton;
