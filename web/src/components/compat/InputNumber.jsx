// Compat layer: Semi Design InputNumber → number input
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const InputNumber = React.forwardRef(
  ({ value, defaultValue, onChange, min, max, step = 1, precision, disabled, size, prefix, suffix, formatter, parser, className, style, placeholder, ...rest }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const handleChange = (e) => {
      let val = e.target.value;
      if (parser) val = parser(val);
      const num = val === '' ? undefined : Number(val);
      if (val !== '' && isNaN(num)) return;
      if (!isControlled) setInternalValue(num);
      if (onChange) onChange(num);
    };

    const displayValue = currentValue !== undefined && currentValue !== null
      ? (formatter ? formatter(String(currentValue)) : String(currentValue))
      : '';

    const sizeClass = size === 'small' ? 'h-8 text-xs' : size === 'large' ? 'h-12 text-base' : '';

    return (
      <div className={cn('relative inline-flex items-center', className)} style={style}>
        {prefix && <span className='mr-2 text-foreground/55'>{prefix}</span>}
        <Input
          ref={ref}
          type='number'
          value={displayValue}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          placeholder={placeholder}
          className={cn('w-full', sizeClass)}
          {...rest}
        />
        {suffix && <span className='ml-2 text-foreground/55'>{suffix}</span>}
      </div>
    );
  }
);
InputNumber.displayName = 'InputNumber';

export { InputNumber };
export default InputNumber;
