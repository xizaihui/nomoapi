// Compat layer: Semi Design Avatar → shadcn/ui Avatar
import * as React from 'react';
import {
  Avatar as ShadcnAvatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const SIZE_MAP = {
  'extra-extra-small': 'h-5 w-5 text-[10px]',
  'extra-small': 'h-6 w-6 text-xs',
  small: 'h-8 w-8 text-xs',
  default: 'h-10 w-10 text-sm',
  medium: 'h-12 w-12 text-base',
  large: 'h-16 w-16 text-lg',
};

const COLOR_MAP = {
  red: 'bg-foreground/60',
  orange: 'bg-foreground/60',
  yellow: 'bg-foreground/50',
  green: 'bg-foreground/60',
  blue: 'bg-foreground/80',
  violet: 'bg-foreground/50',
  cyan: 'bg-foreground/45',
  grey: 'bg-foreground/50',
  amber: 'bg-foreground/50',
  indigo: 'bg-foreground/60',
  pink: 'bg-foreground/50',
  purple: 'bg-foreground/55',
  teal: 'bg-foreground/45',
  lime: 'bg-foreground/50',
  'light-blue': 'bg-foreground/45',
  'light-grey': 'bg-foreground/35',
  transparent: 'bg-transparent',
};

const Avatar = React.forwardRef(
  ({ src, alt, size = 'default', shape = 'circle', color, children, imgAttr, className, style, onClick, ...rest }, ref) => {
    const sizeClass = SIZE_MAP[size] || SIZE_MAP.default;
    const shapeClass = shape === 'square' ? 'rounded-md' : 'rounded-full';
    const colorClass = color ? (COLOR_MAP[color] || 'bg-foreground/80') : 'bg-foreground/50';

    return (
      <ShadcnAvatar
        ref={ref}
        className={cn(sizeClass, shapeClass, onClick && 'cursor-pointer', className)}
        style={style}
        onClick={onClick}
        {...rest}
      >
        {src && <AvatarImage src={src} alt={alt || ''} {...imgAttr} />}
        <AvatarFallback className={cn(shapeClass, colorClass, color === 'transparent' ? '' : 'text-white font-medium')}>
          {children || (alt ? alt.charAt(0).toUpperCase() : '?')}
        </AvatarFallback>
      </ShadcnAvatar>
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar };
export default Avatar;
