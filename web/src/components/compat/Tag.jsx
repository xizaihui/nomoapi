// Compat layer: Semi Design Tag → shadcn/ui Badge
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const COLOR_MAP = {
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200',
  cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200 border-cyan-200',
  green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200',
  grey: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200',
  red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200',
  teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 border-teal-200',
  violet: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200 border-violet-200',
  white: 'bg-white text-gray-800 border-gray-200',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200',
  indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border-indigo-200',
  pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 border-pink-200',
  light-blue: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 border-sky-200',
  light-green: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200 border-lime-200',
};

const TYPE_MAP = {
  primary: 'default',
  secondary: 'secondary',
  warning: 'outline',
  danger: 'destructive',
  ghost: 'outline',
  solid: 'default',
  light: 'secondary',
};

const SIZE_MAP = {
  small: 'text-xs px-1.5 py-0',
  default: 'text-xs px-2.5 py-0.5',
  large: 'text-sm px-3 py-1',
};

const Tag = React.forwardRef(
  ({ children, color, type, size = 'default', closable, onClose, visible = true, shape, prefixIcon, suffixIcon, avatarSrc, avatarShape, className, style, onClick, ...rest }, ref) => {
    if (!visible) return null;

    // If a named color is provided, use custom color classes
    if (color && COLOR_MAP[color]) {
      return (
        <span
          ref={ref}
          className={cn(
            'inline-flex items-center rounded-full border font-semibold transition-colors',
            COLOR_MAP[color],
            SIZE_MAP[size] || SIZE_MAP.default,
            shape === 'square' && 'rounded-md',
            onClick && 'cursor-pointer',
            className
          )}
          style={style}
          onClick={onClick}
          {...rest}
        >
          {prefixIcon && <span className='mr-1'>{prefixIcon}</span>}
          {children}
          {suffixIcon && <span className='ml-1'>{suffixIcon}</span>}
          {closable && (
            <button type='button' className='ml-1 hover:opacity-70' onClick={(e) => { e.stopPropagation(); onClose?.(e); }}>
              ✕
            </button>
          )}
        </span>
      );
    }

    // If a hex/rgb color string
    if (color && !COLOR_MAP[color]) {
      return (
        <span
          ref={ref}
          className={cn(
            'inline-flex items-center rounded-full border font-semibold',
            SIZE_MAP[size] || SIZE_MAP.default,
            shape === 'square' && 'rounded-md',
            className
          )}
          style={{ backgroundColor: color, color: '#fff', borderColor: color, ...style }}
          onClick={onClick}
          {...rest}
        >
          {children}
          {closable && (
            <button type='button' className='ml-1 hover:opacity-70' onClick={(e) => { e.stopPropagation(); onClose?.(e); }}>
              ✕
            </button>
          )}
        </span>
      );
    }

    const variant = TYPE_MAP[type] || 'secondary';

    return (
      <Badge
        ref={ref}
        variant={variant}
        className={cn(
          SIZE_MAP[size] || SIZE_MAP.default,
          shape === 'square' && 'rounded-md',
          onClick && 'cursor-pointer',
          className
        )}
        style={style}
        onClick={onClick}
        {...rest}
      >
        {prefixIcon && <span className='mr-1'>{prefixIcon}</span>}
        {children}
        {suffixIcon && <span className='ml-1'>{suffixIcon}</span>}
        {closable && (
          <button type='button' className='ml-1 hover:opacity-70' onClick={(e) => { e.stopPropagation(); onClose?.(e); }}>
            ✕
          </button>
        )}
      </Badge>
    );
  }
);
Tag.displayName = 'Tag';

export { Tag };
export default Tag;
