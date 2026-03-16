// Compat layer: Semi Design Switch → shadcn/ui Switch
import * as React from 'react';
import { Switch as ShadcnSwitch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const Switch = React.forwardRef(
  ({ checked, defaultChecked, onChange, disabled, loading, size, checkedText, uncheckedText, className, style, ...rest }, ref) => {
    const handleChange = (val) => {
      if (onChange) onChange(val);
    };

    return (
      <div className={cn('inline-flex items-center gap-2', className)} style={style}>
        <ShadcnSwitch
          ref={ref}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={handleChange}
          disabled={disabled || loading}
          className={cn(size === 'small' && 'h-4 w-8 [&>span]:h-3 [&>span]:w-3')}
          {...rest}
        />
        {(checkedText || uncheckedText) && (
          <span className='text-sm text-foreground/55'>
            {checked ? checkedText : uncheckedText}
          </span>
        )}
      </div>
    );
  }
);
Switch.displayName = 'Switch';

export { Switch };
export default Switch;
