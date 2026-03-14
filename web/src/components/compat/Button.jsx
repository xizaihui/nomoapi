// Compat layer: maps Semi Design Button API → shadcn/ui Button
import * as React from 'react';
import { Button as ShadcnButton } from '@/components/ui/button';

const THEME_MAP = {
  solid: 'default',
  light: 'secondary',
  borderless: 'ghost',
  outline: 'outline',
};

const TYPE_MAP = {
  primary: 'default',
  secondary: 'secondary',
  tertiary: 'ghost',
  warning: 'destructive',
  danger: 'destructive',
};

const SIZE_MAP = {
  default: 'default',
  small: 'sm',
  large: 'lg',
};

const Button = React.forwardRef(
  (
    {
      type,
      theme = 'light',
      size = 'default',
      icon,
      iconPosition = 'left',
      loading,
      disabled,
      block,
      className = '',
      children,
      htmlType,
      onClick,
      style,
      ...rest
    },
    ref
  ) => {
    let variant = 'default';
    if (type && TYPE_MAP[type]) {
      variant = TYPE_MAP[type];
    } else if (theme && THEME_MAP[theme]) {
      variant = THEME_MAP[theme];
    }

    const mappedSize = SIZE_MAP[size] || 'default';
    const isIconOnly = icon && !children;

    return (
      <ShadcnButton
        ref={ref}
        variant={variant}
        size={isIconOnly ? 'icon' : mappedSize}
        disabled={disabled || loading}
        className={`${block ? 'w-full' : ''} ${className}`}
        type={htmlType || 'button'}
        onClick={onClick}
        style={style}
        {...rest}
      >
        {loading && (
          <svg
            className='mr-2 h-4 w-4 animate-spin'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
          </svg>
        )}
        {icon && iconPosition === 'left' && !loading && <span className='mr-1'>{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className='ml-1'>{icon}</span>}
      </ShadcnButton>
    );
  }
);
Button.displayName = 'Button';

export { Button };
export default Button;
