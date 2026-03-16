// Compat layer: Semi Design Slider → range slider
import * as React from 'react';
import { cn } from '@/lib/utils';

const Slider = React.forwardRef(
  ({ value, defaultValue, onChange, min = 0, max = 100, step = 1, disabled, vertical, marks, tipFormatter, showBoundary, className, style, ...rest }, ref) => {
    const handleChange = (e) => {
      const val = Number(e.target.value);
      onChange?.(val);
    };

    return (
      <div className={cn('flex items-center gap-3', vertical && 'flex-col', className)} style={style}>
        {showBoundary && <span className='text-xs text-foreground/55'>{min}</span>}
        <input
          ref={ref}
          type='range'
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={cn('flex-1 accent-[hsl(var(--primary))]', vertical && 'writing-mode-vertical-lr h-40')}
          {...rest}
        />
        {showBoundary && <span className='text-xs text-foreground/55'>{max}</span>}
      </div>
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };
export default Slider;
