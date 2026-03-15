// Compat layer: Semi Design Typography → native HTML with tailwind
import * as React from 'react';
import { cn } from '@/lib/utils';

const Text = React.forwardRef(
  ({ children, type, size, strong, underline, delete: del, mark, code, link, href, className, style, ellipsis, copyable, onClick, ...rest }, ref) => {
    const colorMap = {
      primary: 'text-foreground',
      secondary: 'text-muted-foreground',
      tertiary: 'text-muted-foreground dark:text-muted-foreground/60',
      quaternary: 'text-muted-foreground/60 dark:text-muted-foreground',
      success: 'text-foreground/80 dark:text-muted-foreground',
      warning: 'text-amber-600 dark:text-amber-400',
      danger: 'text-foreground/80 dark:text-muted-foreground',
    };
    const sizeMap = {
      small: 'text-xs',
      normal: 'text-sm',
      inherit: '',
    };

    const cls = cn(
      colorMap[type] || 'text-foreground',
      sizeMap[size] || 'text-sm',
      strong && 'font-semibold',
      underline && 'underline',
      del && 'line-through',
      ellipsis && 'truncate',
      className
    );

    if (link || href) {
      return (
        <a ref={ref} href={href} className={cn(cls, 'text-primary hover:underline cursor-pointer')} style={style} onClick={onClick} {...rest}>
          {children}
        </a>
      );
    }
    if (code) {
      return <code ref={ref} className={cn(cls, 'rounded bg-muted px-1 py-0.5 font-mono text-sm')} style={style} {...rest}>{children}</code>;
    }
    if (mark) {
      return <mark ref={ref} className={cn(cls, 'bg-muted dark:bg-muted')} style={style} {...rest}>{children}</mark>;
    }
    return <span ref={ref} className={cls} style={style} onClick={onClick} {...rest}>{children}</span>;
  }
);
Text.displayName = 'Text';

const Title = React.forwardRef(
  ({ heading = 1, children, type, ellipsis, className, style, ...rest }, ref) => {
    const sizeMap = {
      1: 'text-4xl font-bold',
      2: 'text-3xl font-bold',
      3: 'text-2xl font-semibold',
      4: 'text-xl font-semibold',
      5: 'text-lg font-medium',
      6: 'text-base font-medium',
    };
    const Tag = `h${heading}`;
    return (
      <Tag ref={ref} className={cn(sizeMap[heading] || sizeMap[1], ellipsis && 'truncate', className)} style={style} {...rest}>
        {children}
      </Tag>
    );
  }
);
Title.displayName = 'Title';

const Paragraph = React.forwardRef(
  ({ children, type, size, ellipsis, className, style, ...rest }, ref) => {
    const colorMap = {
      secondary: 'text-muted-foreground',
      tertiary: 'text-muted-foreground dark:text-muted-foreground/60',
      success: 'text-foreground/80 dark:text-muted-foreground',
      warning: 'text-amber-600 dark:text-amber-400',
      danger: 'text-foreground/80 dark:text-muted-foreground',
    };
    return (
      <p ref={ref} className={cn('text-sm leading-relaxed', colorMap[type], ellipsis && 'truncate', className)} style={style} {...rest}>
        {children}
      </p>
    );
  }
);
Paragraph.displayName = 'Paragraph';

const Numeral = React.forwardRef(({ children, className, ...rest }, ref) => (
  <span ref={ref} className={cn('font-mono tabular-nums', className)} {...rest}>{children}</span>
));
Numeral.displayName = 'Numeral';

const Typography = { Text, Title, Paragraph, Numeral };
Typography.Text = Text;
Typography.Title = Title;
Typography.Paragraph = Paragraph;
Typography.Numeral = Numeral;

export { Typography };
export default Typography;
