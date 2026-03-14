// Compat layer: Semi Design Collapse → collapsible panels
import * as React from 'react';
import { cn } from '@/lib/utils';

const Collapse = ({ activeKey, defaultActiveKey, onChange, accordion, children, expandIconPosition = 'left', className, style, keepDOM, ...rest }) => {
  const [openKeys, setOpenKeys] = React.useState(
    defaultActiveKey ? (Array.isArray(defaultActiveKey) ? defaultActiveKey : [defaultActiveKey]) : []
  );
  const isControlled = activeKey !== undefined;
  const currentKeys = isControlled ? (Array.isArray(activeKey) ? activeKey : [activeKey]) : openKeys;

  const handleToggle = (key) => {
    let newKeys;
    if (accordion) {
      newKeys = currentKeys.includes(key) ? [] : [key];
    } else {
      newKeys = currentKeys.includes(key)
        ? currentKeys.filter((k) => k !== key)
        : [...currentKeys, key];
    }
    if (!isControlled) setOpenKeys(newKeys);
    onChange?.(accordion ? (newKeys[0] || '') : newKeys);
  };

  return (
    <div className={cn('divide-y rounded-md border', className)} style={style} {...rest}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const key = child.props.itemKey || child.key;
        return React.cloneElement(child, {
          __isOpen: currentKeys.includes(key),
          __onToggle: () => handleToggle(key),
          __keepDOM: keepDOM,
          __expandIconPosition: expandIconPosition,
        });
      })}
    </div>
  );
};

const Panel = ({ header, children, itemKey, disabled, extra, __isOpen, __onToggle, __keepDOM, __expandIconPosition, className, style, ...rest }) => {
  const chevron = (
    <svg className={cn('h-4 w-4 transition-transform', __isOpen && 'rotate-180')} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
      <polyline points='6 9 12 15 18 9' />
    </svg>
  );

  return (
    <div className={cn(disabled && 'opacity-50', className)} style={style} {...rest}>
      <button
        type='button'
        onClick={disabled ? undefined : __onToggle}
        className={cn('flex w-full items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors', disabled && 'cursor-not-allowed')}
      >
        {__expandIconPosition === 'left' && chevron}
        <span className='flex-1 text-left'>{header}</span>
        {extra && <span onClick={(e) => e.stopPropagation()}>{extra}</span>}
        {__expandIconPosition === 'right' && chevron}
      </button>
      {(__keepDOM || __isOpen) && (
        <div className={cn('px-4 pb-3 text-sm', !__isOpen && 'hidden')}>
          {children}
        </div>
      )}
    </div>
  );
};
Panel.displayName = 'Panel';

Collapse.Panel = Panel;

export { Collapse };
export default Collapse;
