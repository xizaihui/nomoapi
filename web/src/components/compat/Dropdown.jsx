// Compat layer: Semi Design Dropdown → shadcn/ui DropdownMenu
import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const renderMenuItems = (menu) => {
  if (!menu || !Array.isArray(menu)) return null;
  return menu.map((item, idx) => {
    if (item.type === 'divider') return <DropdownMenuSeparator key={idx} />;
    if (item.items) {
      return (
        <DropdownMenuSub key={item.node || item.key || idx}>
          <DropdownMenuSubTrigger disabled={item.disabled}>
            {item.icon && <span className='mr-2'>{item.icon}</span>}
            {item.name || item.node}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {renderMenuItems(item.items)}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      );
    }
    return (
      <DropdownMenuItem
        key={item.node || item.key || idx}
        disabled={item.disabled}
        onClick={() => item.onClick?.()}
        className={item.active ? 'bg-accent' : ''}
      >
        {item.icon && <span className='mr-2'>{item.icon}</span>}
        {item.name || item.node}
      </DropdownMenuItem>
    );
  });
};

const Dropdown = ({ trigger = 'hover', position, children, render, menu, clickToHide, className, style, visible, onVisibleChange, ...rest }) => {
  // Semi Dropdown accepts `render` as a ReactNode for the menu content
  // or `menu` as an array of items
  return (
    <DropdownMenu open={visible} onOpenChange={onVisibleChange}>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn(className)} style={style} onClick={(e) => e.stopPropagation()}>
        {render || (menu && renderMenuItems(menu))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Semi Dropdown.Menu — just a fragment wrapper, children go directly into DropdownMenuContent
const Menu = ({ children, className, ...rest }) => <>{children}</>;

// Semi Dropdown.Item — wraps content in DropdownMenuItem
// If the child is a button/link, render it directly to avoid nested interactive elements
const Item = ({ children, onClick, disabled, icon, active, className, type, ...rest }) => {
  // Check if children is a single interactive element (button, a, etc.)
  const child = React.Children.only(children) || children;
  const isInteractive = child?.type === 'button' || child?.type === 'a' ||
    child?.props?.onClick || child?.props?.href ||
    (typeof child?.type === 'function' || typeof child?.type === 'object');

  if (isInteractive && !onClick) {
    // Wrap in a div with role=menuitem styling instead of DropdownMenuItem
    // to avoid nested button/interactive element issues
    return (
      <div
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
          'hover:bg-muted',
          'focus:bg-accent focus:text-accent-foreground',
          disabled && 'pointer-events-none opacity-50',
          active && 'bg-accent',
          className
        )}
        {...rest}
      >
        {icon && <span className='mr-2'>{icon}</span>}
        {children}
      </div>
    );
  }

  return (
    <DropdownMenuItem onClick={onClick} disabled={disabled} className={cn(active && 'bg-accent', className)} {...rest}>
      {icon && <span className='mr-2'>{icon}</span>}
      {children}
    </DropdownMenuItem>
  );
};

const DividerItem = () => <DropdownMenuSeparator />;
const Title = ({ children, className, ...rest }) => (
  <div className={cn('px-2 py-1.5 text-xs font-semibold text-muted-foreground', className)} {...rest}>{children}</div>
);

Dropdown.Menu = Menu;
Dropdown.Item = Item;
Dropdown.Divider = DividerItem;
Dropdown.Title = Title;

export { Dropdown };
export default Dropdown;
