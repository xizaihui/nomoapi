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
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-amber-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  violet: 'bg-violet-500',
  cyan: 'bg-cyan-500',
  grey: 'bg-gray-500',
  amber: 'bg-amber-500',
  indigo: 'bg-indigo-500',
  pink: 'bg-pink-500',
  purple: 'bg-purple-500',
  teal: 'bg-teal-500',
  lime: 'bg-lime-600',
  'light-blue': 'bg-sky-500',
  transparent: 'bg-transparent',
};

const Avatar = React.forwardRef(
  ({ src, alt, size = 'default', shape = 'circle', color, children, imgAttr, className, style, onClick, ...rest }, ref) => {
    const sizeClass = SIZE_MAP[size] || SIZE_MAP.default;
    const shapeClass = shape === 'square' ? 'rounded-md' : 'rounded-full';
    const colorClass = color ? (COLOR_MAP[color] || 'bg-blue-500') : 'bg-gray-500';

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
