// Compat layer: maps Semi Design Input API → shadcn/ui Input
import * as React from 'react';
import { Input as ShadcnInput } from '@/components/ui/input';
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(
  (
    {
      prefix,
      suffix,
      addonBefore,
      addonAfter,
      showClear,
      size = 'default',
      validateStatus,
      value,
      defaultValue,
      onChange,
      onClear,
      className,
      style,
      disabled,
      placeholder,
      type,
      ...rest
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const handleChange = (e) => {
      const val = e.target.value;
      if (!isControlled) setInternalValue(val);
      // Semi onChange signature: (value, e) => void
      if (onChange) onChange(val, e);
    };

    const handleClear = () => {
      if (!isControlled) setInternalValue('');
      if (onChange) onChange('', null);
      if (onClear) onClear();
    };

    const sizeClass = size === 'small' ? 'h-8 text-xs' : size === 'large' ? 'h-12 text-base' : '';
    const statusClass =
      validateStatus === 'error'
        ? 'border-destructive'
        : validateStatus === 'warning'
          ? 'border-[hsl(var(--chart-4))]'
          : '';

    return (
      <div className={cn('relative flex items-center', className)} style={style}>
        {(prefix || addonBefore) && (
          <span className='mr-2 flex items-center text-foreground/55'>
            {addonBefore}
            {prefix}
          </span>
        )}
        <ShadcnInput
          ref={ref}
          type={type}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          className={cn('flex-1', sizeClass, statusClass)}
          {...rest}
        />
        {showClear && currentValue && (
          <button
            type='button'
            onClick={handleClear}
            className='absolute right-2 text-foreground/50 hover:text-foreground'
          >
            ✕
          </button>
        )}
        {(suffix || addonAfter) && (
          <span className='ml-2 flex items-center text-foreground/55'>
            {suffix}
            {addonAfter}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// Semi TextArea compat
const TextArea = React.forwardRef(
  ({ value, defaultValue, onChange, autosize, maxCount, className, ...rest }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const handleChange = (e) => {
      const val = e.target.value;
      if (!isControlled) setInternalValue(val);
      if (onChange) onChange(val, e);
    };

    return (
      <div className='relative'>
        <ShadcnTextarea
          ref={ref}
          value={currentValue}
          onChange={handleChange}
          className={className}
          {...rest}
        />
        {maxCount && (
          <span className='absolute bottom-2 right-2 text-xs text-foreground/50'>
            {currentValue.length}/{maxCount}
          </span>
        )}
      </div>
    );
  }
);
TextArea.displayName = 'TextArea';

export { Input, TextArea };
export default Input;
