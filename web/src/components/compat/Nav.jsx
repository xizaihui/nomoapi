// Compat layer: Semi Design Nav → navigation component
import * as React from 'react';
import { cn } from '@/lib/utils';

const Nav = React.forwardRef(({
  items = [],
  selectedKeys = [],
  defaultSelectedKeys,
  onSelect,
  isCollapsed,
  header,
  footer,
  children,
  mode = 'vertical',
  className,
  style,
  renderWrapper,
  ...rest
}, ref) => {
  const [selected, setSelected] = React.useState(defaultSelectedKeys || []);
  const isControlled = selectedKeys.length > 0;
  const currentSelected = isControlled ? selectedKeys : selected;

  const handleSelect = (data) => {
    if (!isControlled) setSelected([data.itemKey]);
    onSelect?.(data);
  };

  const renderItems = (itemList) => {
    return (itemList || []).map((item) => {
      if (item.items) {
        return (
          <div key={item.itemKey} className='mb-1'>
            {!isCollapsed && (
              <div className='px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                {item.icon && <span className='mr-2'>{item.icon}</span>}
                {item.text}
              </div>
            )}
            <div className='ml-2'>
              {renderItems(item.items)}
            </div>
          </div>
        );
      }
      const isActive = currentSelected.includes(item.itemKey);
      return (
        <button
          key={item.itemKey}
          type='button'
          onClick={() => handleSelect({ itemKey: item.itemKey, selectedKeys: [item.itemKey] })}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
            isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            isCollapsed && 'justify-center px-2'
          )}
          title={isCollapsed ? item.text : undefined}
        >
          {item.icon && <span className='flex-shrink-0'>{item.icon}</span>}
          {!isCollapsed && <span className='truncate'>{item.text}</span>}
        </button>
      );
    });
  };

  return (
    <nav
      ref={ref}
      className={cn(
        'flex flex-col gap-1',
        mode === 'horizontal' && 'flex-row items-center',
        className
      )}
      style={style}
      {...rest}
    >
      {header && <div className={cn('mb-2', isCollapsed && 'flex justify-center')}>{typeof header === 'object' && header.logo ? header.logo : header}</div>}
      {items.length > 0 ? renderItems(items) : children}
      {footer && <div className='mt-auto pt-2'>{typeof footer === 'object' && footer.collapseButton ? footer.collapseButton : footer}</div>}
    </nav>
  );
});
Nav.displayName = 'Nav';

// Sub-components for JSX usage
const Item = ({ itemKey, text, icon, children, ...rest }) => null;
Item.displayName = 'Item';

const Sub = ({ itemKey, text, icon, children, ...rest }) => null;
Sub.displayName = 'Sub';

const NavHeader = ({ children, logo, text, ...rest }) => null;
NavHeader.displayName = 'Header';

const NavFooter = ({ children, collapseButton, ...rest }) => null;
NavFooter.displayName = 'Footer';

Nav.Item = Item;
Nav.Sub = Sub;
Nav.Header = NavHeader;
Nav.Footer = NavFooter;

export { Nav };
export default Nav;
