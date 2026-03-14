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

// Radix Select does not allow empty string values.
// We use a sentinel to represent "empty" internally.
const EMPTY_SENTINEL = '__empty__';
const toRadix = (v) => (v === '' || v === null || v === undefined) ? EMPTY_SENTINEL : String(v);
const fromRadix = (v) => v === EMPTY_SENTINEL ? '' : v;

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
    const handleChange = (val) => {
      if (onChange) onChange(fromRadix(val));
    };

    const radixValue = value !== undefined ? toRadix(value) : undefined;
    const radixDefault = defaultValue !== undefined ? toRadix(defaultValue) : undefined;

    // If children are provided (Semi pattern: <Select><Select.Option>), render them
    if (children) {
      return (
        <ShadcnSelect value={radixValue} defaultValue={radixDefault} onValueChange={handleChange} disabled={disabled}>
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
      <ShadcnSelect value={radixValue} defaultValue={radixDefault} onValueChange={handleChange} disabled={disabled}>
        <SelectTrigger className={cn(className)} style={style} ref={ref}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {optionList.map((opt) => (
            <SelectItem key={opt.value ?? '__empty'} value={toRadix(opt.value)} disabled={opt.disabled}>
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
  <SelectItem value={toRadix(value)} disabled={disabled} {...rest}>
    {children}
  </SelectItem>
);
Option.displayName = 'Option';

Select.Option = Option;

export { Select };
export default Select;
