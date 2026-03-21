// Compat layer: Semi Design Tag → monochrome pill
import * as React from 'react';
import { cn } from '@/lib/utils';

const SIZE_MAP = {
  small: 'text-[11px] px-1.5 py-0',
  default: 'text-xs px-2 py-0.5',
  large: 'text-xs px-2.5 py-0.5',
};

const Tag = React.forwardRef(
  ({ children, color, type, size = 'default', closable, onClose, visible = true, shape, prefixIcon, suffixIcon, avatarSrc, avatarShape, className, style, onClick, ...rest }, ref) => {
    if (!visible) return null;

    // All tags are monochrome now — ignore color prop for styling
    // Only use color for hex/rgb inline backgrounds when explicitly set to a non-named color
    const isHexColor = color && color.startsWith('#');
    const isRgbColor = color && color.startsWith('rgb');

    let tagStyle = style;
    let tagClass = cn(
      'inline-flex items-center font-medium border transition-colors',
      SIZE_MAP[size] || SIZE_MAP.default,
      shape === 'circle' || shape === 'round' ? 'rounded-full' : 'rounded-md',
      onClick && 'cursor-pointer',
    );

    if (isHexColor || isRgbColor) {
      // Custom color: use it as bg with white text
      tagClass = cn(tagClass, 'text-white border-transparent');
      tagStyle = { backgroundColor: color, ...style };
    } else if (type === 'danger' || type === 'warning') {
      tagClass = cn(tagClass, 'bg-foreground/5 text-foreground/80 border-border/50');
    } else if (style?.color === 'white') {
      // White text requested → dark bg
      tagClass = cn(tagClass, 'bg-foreground text-background border-transparent');
      tagStyle = { ...style, color: undefined };
    } else {
      // Default: subtle monochrome
      tagClass = cn(tagClass, 'bg-muted text-foreground/80 border-transparent');
    }

    return (
      <span
        ref={ref}
        className={cn(tagClass, className)}
        style={tagStyle}
        onClick={onClick}
        {...rest}
      >
        {prefixIcon && <span className='mr-1'>{prefixIcon}</span>}
        {children}
        {suffixIcon && <span className='ml-1'>{suffixIcon}</span>}
        {closable && (
          <button type='button' className='ml-1 opacity-50 hover:opacity-100' onClick={(e) => { e.stopPropagation(); onClose?.(e); }}>
            ×
          </button>
        )}
      </span>
    );
  }
);
Tag.displayName = 'Tag';

export { Tag };
export default Tag;
