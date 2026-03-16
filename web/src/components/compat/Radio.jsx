// Compat layer: Semi Design Radio/RadioGroup → shadcn/ui based
import * as React from 'react';
import { cn } from '@/lib/utils';

const Radio = React.forwardRef(
  ({ checked, defaultChecked, onChange, children, disabled, value, extra, _cardMode, className, style, ...rest }, ref) => {
    // Card mode: render as selectable card
    if (_cardMode) {
      return (
        <label
          className={cn(
            'flex flex-col gap-1 rounded-lg border p-4 cursor-pointer transition-colors',
            checked ? 'border-foreground bg-muted/50' : 'border-border hover:border-foreground/30',
            disabled && 'opacity-50 cursor-not-allowed',
            className,
          )}
          style={style}
        >
          <div className='flex items-center gap-2'>
            <input
              ref={ref}
              type='radio'
              checked={checked}
              defaultChecked={defaultChecked}
              onChange={onChange}
              disabled={disabled}
              value={value}
              className='h-4 w-4 accent-[hsl(var(--primary))]'
            />
            <span className='text-sm font-medium'>{children}</span>
          </div>
          {extra && <span className='text-xs text-foreground/60 pl-6'>{extra}</span>}
        </label>
      );
    }

    return (
      <label className={cn('flex items-center gap-2 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)} style={style}>
        <input
          ref={ref}
          type='radio'
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          disabled={disabled}
          value={value}
          className='h-4 w-4 accent-[hsl(var(--primary))]'
          {...rest}
        />
        <span className='text-sm'>{children}</span>
        {extra && <span className='text-xs text-foreground/60'>{extra}</span>}
      </label>
    );
  }
);
Radio.displayName = 'Radio';

const RadioGroup = ({ value, defaultValue, onChange, options, direction = 'horizontal', disabled, type, buttonSize, children, className, style, ...rest }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (val) => {
    if (!isControlled) setInternalValue(val);
    if (onChange) {
      onChange({ target: { value: val } });
    }
  };

  // If type='button', render as button group
  if (type === 'button') {
    const items = options || [];
    return (
      <div className={cn('inline-flex rounded-md border bg-muted p-1', className)} style={style} {...rest}>
        {items.map((opt) => {
          const optValue = typeof opt === 'string' ? opt : opt.value;
          const optLabel = typeof opt === 'string' ? opt : opt.label;
          const isActive = currentValue === optValue;
          return (
            <button
              key={optValue}
              type='button'
              onClick={() => handleChange(optValue)}
              disabled={disabled}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-sm transition-colors',
                isActive ? 'bg-background text-foreground shadow-sm' : 'text-foreground/60 hover:text-foreground'
              )}
            >
              {optLabel}
            </button>
          );
        })}
      </div>
    );
  }

  // If children provided (Semi pattern)
  if (children) {
    const isCard = type === 'card';
    return (
      <div className={cn('flex gap-3', direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap', className)} style={style} {...rest}>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(child, {
            checked: currentValue === child.props.value,
            onChange: () => handleChange(child.props.value),
            disabled: disabled || child.props.disabled,
            ...(isCard ? { _cardMode: true } : {}),
          });
        })}
      </div>
    );
  }

  // Options array
  return (
    <div className={cn('flex gap-3', direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap', className)} style={style} {...rest}>
      {(options || []).map((opt) => {
        const optValue = typeof opt === 'string' ? opt : opt.value;
        const optLabel = typeof opt === 'string' ? opt : opt.label;
        const optDisabled = typeof opt === 'object' ? opt.disabled : false;
        return (
          <Radio
            key={optValue}
            value={optValue}
            checked={currentValue === optValue}
            onChange={() => handleChange(optValue)}
            disabled={disabled || optDisabled}
          >
            {optLabel}
          </Radio>
        );
      })}
    </div>
  );
};

Radio.Group = RadioGroup;

export { Radio, RadioGroup };
export default Radio;
