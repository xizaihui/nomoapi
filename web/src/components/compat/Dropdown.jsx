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
      <DropdownMenuContent className={cn(className)} style={style}>
        {render || (menu && renderMenuItems(menu))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Semi Dropdown.Menu / Dropdown.Item / Dropdown.Divider compat
const Menu = ({ children, className, ...rest }) => <div className={className} {...rest}>{children}</div>;
const Item = ({ children, onClick, disabled, icon, active, className, ...rest }) => (
  <DropdownMenuItem onClick={onClick} disabled={disabled} className={cn(active && 'bg-accent', className)} {...rest}>
    {icon && <span className='mr-2'>{icon}</span>}
    {children}
  </DropdownMenuItem>
);
const DividerItem = () => <DropdownMenuSeparator />;

Dropdown.Menu = Menu;
Dropdown.Item = Item;
Dropdown.Divider = DividerItem;

export { Dropdown };
export default Dropdown;
