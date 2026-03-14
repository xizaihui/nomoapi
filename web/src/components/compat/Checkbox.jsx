// Compat layer: Semi Design Checkbox → shadcn/ui Checkbox
import * as React from 'react';
import { Checkbox as ShadcnCheckbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef(
  ({ checked, defaultChecked, onChange, children, disabled, indeterminate, className, style, value, ...rest }, ref) => {
    const handleChange = (val) => {
      if (onChange) {
        // Semi onChange: (e: { target: { checked } }) => void
        onChange({ target: { checked: val, value } });
      }
    };

    return (
      <div className={cn('flex items-center gap-2', className)} style={style}>
        <ShadcnCheckbox
          ref={ref}
          checked={indeterminate ? 'indeterminate' : checked}
          defaultChecked={defaultChecked}
          onCheckedChange={handleChange}
          disabled={disabled}
          {...rest}
        />
        {children && <Label className='cursor-pointer font-normal'>{children}</Label>}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

// Checkbox.Group compat
const CheckboxGroup = ({ options, value, defaultValue, onChange, direction = 'horizontal', disabled, className, children, ...rest }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || []);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleItemChange = (itemValue, checked) => {
    const newValue = checked
      ? [...currentValue, itemValue]
      : currentValue.filter((v) => v !== itemValue);
    if (!isControlled) setInternalValue(newValue);
    if (onChange) onChange(newValue);
  };

  if (children) {
    return (
      <div className={cn('flex gap-3', direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap', className)} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn('flex gap-3', direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap', className)} {...rest}>
      {(options || []).map((opt) => {
        const optValue = typeof opt === 'string' ? opt : opt.value;
        const optLabel = typeof opt === 'string' ? opt : opt.label;
        const optDisabled = typeof opt === 'object' ? opt.disabled : false;
        return (
          <Checkbox
            key={optValue}
            checked={currentValue.includes(optValue)}
            onChange={(e) => handleItemChange(optValue, e.target.checked)}
            disabled={disabled || optDisabled}
          >
            {optLabel}
          </Checkbox>
        );
      })}
    </div>
  );
};

Checkbox.Group = CheckboxGroup;

export { Checkbox };
export default Checkbox;
