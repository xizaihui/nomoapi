// Compat layer: maps Semi Design Select API → shadcn/ui Select
import * as React from 'react';
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const Select = React.forwardRef(
  (
    {
      optionList = [],
      value,
      defaultValue,
      onChange,
      placeholder,
      disabled,
      multiple,
      filter,
      className,
      style,
      size,
      prefix,
      suffix,
      showClear,
      renderSelectedItem,
      children,
      ...rest
    },
    ref
  ) => {
    // For simple single select
    const handleChange = (val) => {
      if (onChange) onChange(val);
    };

    // If children are provided (Semi pattern: <Select><Select.Option>), render them
    if (children) {
      return (
        <ShadcnSelect value={value !== undefined ? String(value) : undefined} defaultValue={defaultValue !== undefined ? String(defaultValue) : undefined} onValueChange={handleChange} disabled={disabled}>
          <SelectTrigger className={cn(className)} style={style} ref={ref}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {children}
          </SelectContent>
        </ShadcnSelect>
      );
    }

    return (
      <ShadcnSelect value={value !== undefined ? String(value) : undefined} defaultValue={defaultValue !== undefined ? String(defaultValue) : undefined} onValueChange={handleChange} disabled={disabled}>
        <SelectTrigger className={cn(className)} style={style} ref={ref}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {optionList.map((opt) => (
            <SelectItem key={opt.value} value={String(opt.value)} disabled={opt.disabled}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </ShadcnSelect>
    );
  }
);
Select.displayName = 'Select';

// Semi Select.Option compat
const Option = ({ value, children, disabled, ...rest }) => (
  <SelectItem value={String(value)} disabled={disabled} {...rest}>
    {children}
  </SelectItem>
);
Option.displayName = 'Option';

Select.Option = Option;

export { Select };
export default Select;
