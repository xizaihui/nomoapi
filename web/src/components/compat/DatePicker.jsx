// Compat layer: Semi Design DatePicker → native HTML date/datetime input
// Supports: type='date'|'dateTime'|'dateRange'|'dateTimeRange'
import * as React from 'react';
import { cn } from '@/lib/utils';

const DatePicker = React.forwardRef(({
  value,
  defaultValue,
  onChange,
  type = 'date',
  placeholder,
  disabled,
  inputReadOnly,
  className,
  style,
  presets,
  showClear,
  format,
  ...rest
}, ref) => {
  const isRange = type === 'dateTimeRange' || type === 'dateRange';
  const inputType = type === 'dateTime' || type === 'dateTimeRange' ? 'datetime-local' : 'date';

  const toInputValue = (v) => {
    if (!v) return '';
    const d = v instanceof Date ? v : new Date(v);
    if (isNaN(d.getTime())) return '';
    if (inputType === 'datetime-local') {
      return d.toISOString().slice(0, 16);
    }
    return d.toISOString().slice(0, 10);
  };

  const fromInputValue = (str) => {
    if (!str) return null;
    return new Date(str);
  };

  if (isRange) {
    const [start, end] = Array.isArray(value) ? value : [null, null];
    return (
      <div className={cn('flex items-center gap-2', className)} style={style}>
        <input
          ref={ref}
          type={inputType}
          value={toInputValue(start)}
          readOnly={inputReadOnly}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => {
            const newStart = fromInputValue(e.target.value);
            onChange?.([newStart, end instanceof Date ? end : fromInputValue(end)]);
          }}
          className='flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
        />
        <span className='text-foreground/55 text-sm'>~</span>
        <input
          type={inputType}
          value={toInputValue(end)}
          readOnly={inputReadOnly}
          disabled={disabled}
          onChange={(e) => {
            const newEnd = fromInputValue(e.target.value);
            onChange?.([start instanceof Date ? start : fromInputValue(start), newEnd]);
          }}
          className='flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
        />
      </div>
    );
  }

  return (
    <input
      ref={ref}
      type={inputType}
      value={toInputValue(value)}
      readOnly={inputReadOnly}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => {
        onChange?.(fromInputValue(e.target.value));
      }}
      className={cn('flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', className)}
      style={style}
    />
  );
});

DatePicker.displayName = 'DatePicker';

export { DatePicker };
export default DatePicker;
